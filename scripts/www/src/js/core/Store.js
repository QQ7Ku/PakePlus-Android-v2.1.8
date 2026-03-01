/**
 * Store - Centralized State Management
 * Fixes: State immutability, computed properties
 */

class Store {
    constructor() {
        this.state = this.getInitialState();
        this.listeners = new Set();
        this.computedCache = new Map();
        this.computedDirty = new Set();
        
        // Reference to event bus for emitting events
        this.eventBus = null;
    }
    
    setEventBus(eventBus) {
        this.eventBus = eventBus;
    }

    getInitialState() {
        return {
            ui: {
                isMerchantMode: false,
                currentView: 'inspection',
                selectedPointId: null,
                isLoading: true,
                loadingText: '初始化...',
                loadingProgress: 0,
                activeModal: null,
                inspectionType: 'paint'  // 'paint', 'structure', or null for all
            },
            flow: {
                isActive: false,
                currentStep: 0,
                totalSteps: Constants.FLOW_CONFIG.TOTAL_STEPS,
                completedSteps: new Set()
            },
            filter: {
                severity: null,
                category: null
            },
            data: {
                vehicleInfo: null,
                points: {},
                issues: []
            }
        };
    }

    getState() {
        return this.state;
    }

    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    dispatch(action) {
        const prevState = this.state;
        this.state = this.reducer(this.state, action);
        // Emit flow events
        if (this.eventBus && action.type.startsWith('FLOW/')) {
            switch (action.type) {
                case 'FLOW/START':
                    this.eventBus.emit(Events.FLOW_STARTED);
                    break;
                case 'FLOW/NEXT':
                case 'FLOW/PREV':
                case 'FLOW/JUMP':
                    this.eventBus.emit(Events.FLOW_STEP_CHANGED, this.state.flow.currentStep);
                    break;
                case 'FLOW/RESET':
                    this.eventBus.emit(Events.FLOW_COMPLETED);
                    break;
            }
        }
        
        // Mark computed properties as dirty
        this.computedDirty.add('allIssues');
        this.computedDirty.add('summary');
        
        // Notify listeners
        this.listeners.forEach(listener => {
            try {
                listener(this.state, prevState, action);
            } catch (error) {
                console.error('Store listener error:', error);
            }
        });
        
        return action;
    }

    reducer(state, action) {
        switch (action.type) {
            // UI Actions
            case 'UI/SET_MERCHANT_MODE':
                return {
                    ...state,
                    ui: { ...state.ui, isMerchantMode: action.payload }
                };
            
            case 'UI/SELECT_POINT':
                return {
                    ...state,
                    ui: { ...state.ui, selectedPointId: action.payload }
                };
            
            case 'UI/SET_LOADING':
                return {
                    ...state,
                    ui: {
                        ...state.ui,
                        isLoading: action.payload.loading,
                        loadingText: action.payload.text || state.ui.loadingText,
                        loadingProgress: action.payload.progress ?? state.ui.loadingProgress
                    }
                };
            
            case 'UI/OPEN_MODAL':
                return {
                    ...state,
                    ui: { ...state.ui, activeModal: action.payload }
                };
            
            case 'UI/CLOSE_MODAL':
                return {
                    ...state,
                    ui: { ...state.ui, activeModal: null }
                };

            case 'UI/SET_CAMERA_VIEW':
                return {
                    ...state,
                    ui: { ...state.ui, currentView: action.payload }
                };

            case 'UI/SET_INSPECTION_TYPE':
                return {
                    ...state,
                    ui: { ...state.ui, inspectionType: action.payload }
                };

            // Flow Actions
            case 'FLOW/START':
                return {
                    ...state,
                    flow: {
                        ...state.flow,
                        isActive: true,
                        currentStep: 1,
                        completedSteps: new Set()
                    }
                };
            
            case 'FLOW/NEXT':
                return {
                    ...state,
                    flow: {
                        ...state.flow,
                        currentStep: Math.min(state.flow.currentStep + 1, state.flow.totalSteps)
                    }
                };
            
            case 'FLOW/PREV':
                return {
                    ...state,
                    flow: {
                        ...state.flow,
                        currentStep: Math.max(state.flow.currentStep - 1, 1)
                    }
                };
            
            case 'FLOW/JUMP':
                return {
                    ...state,
                    flow: {
                        ...state.flow,
                        currentStep: Math.max(1, Math.min(action.payload, state.flow.totalSteps))
                    }
                };
            
            case 'FLOW/COMPLETE_STEP':
                return {
                    ...state,
                    flow: {
                        ...state.flow,
                        completedSteps: new Set([...state.flow.completedSteps, action.payload])
                    }
                };
            
            case 'FLOW/RESET':
                return {
                    ...state,
                    flow: {
                        isActive: false,
                        currentStep: 0,
                        totalSteps: Constants.FLOW_CONFIG.TOTAL_STEPS,
                        completedSteps: new Set()
                    }
                };

            // Filter Actions
            case 'FILTER/SET_SEVERITY':
                return {
                    ...state,
                    filter: { ...state.filter, severity: action.payload }
                };
            
            case 'FILTER/CLEAR':
                return {
                    ...state,
                    filter: { severity: null, category: null }
                };

            // Data Actions
            case 'DATA/SET_POINTS':
                return {
                    ...state,
                    data: { ...state.data, points: action.payload }
                };
            
            case 'DATA/SET_VEHICLE_INFO':
                return {
                    ...state,
                    data: { ...state.data, vehicleInfo: action.payload }
                };
            
            case 'DATA/RESET':
                return {
                    ...state,
                    data: {
                        vehicleInfo: null,
                        points: {},
                        issues: []
                    }
                };

            default:
                return state;
        }
    }

    // Computed properties
    getComputed(name) {
        if (!this.computedDirty.has(name) && this.computedCache.has(name)) {
            return this.computedCache.get(name);
        }
        
        let result;
        switch (name) {
            case 'allIssues':
                result = this.computeAllIssues();
                break;
            case 'summary':
                result = this.computeSummary();
                break;
            default:
                return null;
        }
        
        this.computedCache.set(name, result);
        this.computedDirty.delete(name);
        return result;
    }

    computeAllIssues() {
        const issues = [];
        const points = this.state.data.points;
        
        Object.values(points).forEach(point => {
            if (point.issues && point.issues.length > 0) {
                point.issues.forEach(issue => {
                    issues.push({
                        ...issue,
                        pointId: point.id,
                        pointName: point.name,
                        pointCategory: point.category
                    });
                });
            }
        });
        
        return issues;
    }

    computeSummary() {
        const issues = this.getComputed('allIssues');
        const points = Object.values(this.state.data.points);
        
        // Calculate score using centralized scoring rules
        let score = SCORING_RULES.MAX_SCORE;
        issues.forEach(issue => {
            score -= SCORING_RULES.DEDUCTIONS[issue.severity] || 0;
        });
        score = Math.max(SCORING_RULES.MIN_SCORE, Math.min(SCORING_RULES.MAX_SCORE, score));
        
        // Get grade based on score thresholds
        const grade = SCORING_RULES.GRADES.find(g => score >= g.min) || 
                      SCORING_RULES.GRADES[SCORING_RULES.GRADES.length - 1];
        
        // Count by severity
        const severityCounts = {
            normal: issues.filter(i => i.severity === 'normal').length,
            minor: issues.filter(i => i.severity === 'minor').length,
            moderate: issues.filter(i => i.severity === 'moderate').length,
            severe: issues.filter(i => i.severity === 'severe').length
        };
        
        // Total cost
        const totalCost = issues.reduce((sum, i) => sum + (i.cost || 0), 0);
        
        return {
            score,
            grade,
            totalIssues: issues.length,
            totalCost,
            severityCounts
        };
    }

    // Helper methods
    setMerchantMode(enabled) {
        this.dispatch({ type: 'UI/SET_MERCHANT_MODE', payload: enabled });
    }

    selectPoint(pointId) {
        this.dispatch({ type: 'UI/SELECT_POINT', payload: pointId });
    }

    setLoading(loading, text = '', progress = 0) {
        this.dispatch({
            type: 'UI/SET_LOADING',
            payload: { loading, text, progress }
        });
    }

    openModal(modalId) {
        this.dispatch({ type: 'UI/OPEN_MODAL', payload: modalId });
    }

    closeModal() {
        this.dispatch({ type: 'UI/CLOSE_MODAL' });
    }

    setCameraView(view) {
        this.dispatch({ type: 'UI/SET_CAMERA_VIEW', payload: view });
    }
}

const store = new Store();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Store, store };
} else {
    window.Store = Store;
    window.store = store;
}
