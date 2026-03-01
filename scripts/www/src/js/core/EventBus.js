/**
 * Event Bus - Centralized Event Management
 * Fixes: Memory leaks, duplicate listeners
 */

class EventBus {
    constructor() {
        this.events = new Map();
        this.onceEvents = new WeakMap();
    }

    on(event, callback, context = null) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        
        // Prevent duplicate listeners
        const listeners = this.events.get(event);
        const exists = listeners.some(l => l.callback === callback && l.context === context);
        if (exists) return () => {};
        
        listeners.push({ callback, context });
        
        return () => this.off(event, callback);
    }

    once(event, callback, context = null) {
        const onceWrapper = (...args) => {
            this.off(event, onceWrapper);
            callback.apply(context, args);
        };
        
        return this.on(event, onceWrapper, context);
    }

    off(event, callback) {
        if (!this.events.has(event)) return;
        
        const listeners = this.events.get(event);
        const index = listeners.findIndex(l => l.callback === callback);
        
        if (index !== -1) {
            listeners.splice(index, 1);
        }
        
        if (listeners.length === 0) {
            this.events.delete(event);
        }
    }

    emit(event, ...args) {
        if (!this.events.has(event)) return false;
        
        const listeners = this.events.get(event);
        
        // Create copy to prevent modification during iteration
        [...listeners].forEach(({ callback, context }) => {
            try {
                callback.apply(context, args);
            } catch (error) {
                console.error(`EventBus error in '${event}':`, error);
            }
        });
        
        return true;
    }

    hasListeners(event) {
        return this.events.has(event) && this.events.get(event).length > 0;
    }

    removeAll(event) {
        if (event) {
            this.events.delete(event);
        } else {
            this.events.clear();
        }
    }
}

// Event Names
const Events = {
    // App
    APP_READY: 'app:ready',
    
    // Points
    POINT_SELECTED: 'point:selected',
    POINT_CLICKED: 'point:clicked',
    POINT_HOVERED: 'point:hovered',
    POINT_STATUS_CHANGED: 'point:status:changed',
    
    // Issues
    ISSUE_ADDED: 'issue:added',
    ISSUE_UPDATED: 'issue:updated',
    ISSUE_DELETED: 'issue:deleted',
    
    // Flow
    FLOW_STARTED: 'flow:started',
    FLOW_STEP_CHANGED: 'flow:step:changed',
    FLOW_COMPLETED: 'flow:completed',
    
    // UI
    MODE_CHANGED: 'mode:changed',
    MODAL_OPEN: 'modal:open',
    MODAL_CLOSE: 'modal:close',
    
    // Data
    DATA_LOADED: 'data:loaded',
    DATA_SAVED: 'data:saved',
    DATA_RESET: 'data:reset',
    
    // 3D
    MODEL_LOADED: 'model:loaded',
    MODEL_PROGRESS: 'model:progress',
    CAMERA_CHANGED: 'camera:changed',
    
    // Export
    EXPORT_START: 'export:start',
    EXPORT_COMPLETE: 'export:complete'
};

const eventBus = new EventBus();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EventBus, Events, eventBus };
} else {
    window.EventBus = EventBus;
    window.Events = Events;
    window.eventBus = eventBus;
}
