/**
 * BYD Qin Pro DM 2019 Model Generator
 * Generates a procedural 3D model of the BYD Qin Pro DM
 */

class BYDQinProModel {
    constructor() {
        this.materials = this.createMaterials();
    }
    
    createMaterials() {
        // Main body color - 赤帝红 (Emperor Red)
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0xcc0000,
            metalness: 0.7,
            roughness: 0.2,
            envMapIntensity: 1.0
        });
        
        // Glass material
        const glassMaterial = new THREE.MeshStandardMaterial({
            color: 0x111111,
            metalness: 0.9,
            roughness: 0.05,
            transparent: true,
            opacity: 0.7
        });
        
        // Chrome material
        const chromeMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            metalness: 1.0,
            roughness: 0.1
        });
        
        // Black plastic material
        const plasticMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.1,
            roughness: 0.8
        });
        
        // Tire material
        const tireMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.1,
            roughness: 0.9
        });
        
        // Rim material
        const rimMaterial = new THREE.MeshStandardMaterial({
            color: 0xcccccc,
            metalness: 0.8,
            roughness: 0.2
        });
        
        // Light emission materials
        const headlightMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0xffffff,
            emissiveIntensity: 0.5,
            metalness: 0.5,
            roughness: 0.2
        });
        
        const taillightMaterial = new THREE.MeshStandardMaterial({
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 0.3,
            metalness: 0.5,
            roughness: 0.2
        });
        
        return {
            body: bodyMaterial,
            glass: glassMaterial,
            chrome: chromeMaterial,
            plastic: plasticMaterial,
            tire: tireMaterial,
            rim: rimMaterial,
            headlight: headlightMaterial,
            taillight: taillightMaterial
        };
    }
    
    /**
     * Update the body color of the car
     * @param {number} colorHex - Hex color value (e.g., 0xcc0000)
     */
    updateBodyColor(colorHex) {
        if (this.materials && this.materials.body) {
            this.materials.body.color.setHex(colorHex);
        }
    }
    
    generate() {
        const carGroup = new THREE.Group();
        
        // Main body dimensions (BYD Qin Pro DM approximate)
        // Length: ~4765mm, Width: ~1837mm, Height: ~1495mm
        // Scale to meters: 4.765m x 1.837m x 1.495m
        
        // Create main body parts
        this.createMainBody(carGroup);
        this.createCabin(carGroup);
        this.createWindows(carGroup);
        this.createWheels(carGroup);
        this.createLights(carGroup);
        this.createDetails(carGroup);
        
        return carGroup;
    }
    
    createMainBody(group) {
        // Lower body (main chassis)
        const lowerBodyGeo = new THREE.BoxGeometry(1.8, 0.7, 4.5);
        // Modify vertices to create car shape
        const lowerBody = new THREE.Mesh(lowerBodyGeo, this.materials.body);
        lowerBody.position.y = 0.65;
        lowerBody.castShadow = true;
        lowerBody.receiveShadow = true;
        group.add(lowerBody);
        
        // Front section (hood and front face)
        const hoodGeo = new THREE.BoxGeometry(1.75, 0.15, 1.4);
        const hood = new THREE.Mesh(hoodGeo, this.materials.body);
        hood.position.set(0, 1.15, 1.6);
        hood.rotation.x = -0.05;
        hood.castShadow = true;
        group.add(hood);
        
        // Front bumper
        const frontBumperGeo = new THREE.BoxGeometry(1.8, 0.4, 0.3);
        const frontBumper = new THREE.Mesh(frontBumperGeo, this.materials.body);
        frontBumper.position.set(0, 0.4, 2.35);
        frontBumper.castShadow = true;
        group.add(frontBumper);
        
        // Rear trunk section
        const trunkGeo = new THREE.BoxGeometry(1.75, 0.5, 0.9);
        const trunk = new THREE.Mesh(trunkGeo, this.materials.body);
        trunk.position.set(0, 1.1, -1.85);
        trunk.rotation.x = 0.05;
        trunk.castShadow = true;
        group.add(trunk);
        
        // Rear bumper
        const rearBumperGeo = new THREE.BoxGeometry(1.8, 0.45, 0.25);
        const rearBumper = new THREE.Mesh(rearBumperGeo, this.materials.body);
        rearBumper.position.set(0, 0.45, -2.35);
        rearBumper.castShadow = true;
        group.add(rearBumper);
        
        // Side panels - left front fender
        const leftFenderGeo = new THREE.BoxGeometry(0.15, 0.6, 1.2);
        const leftFender = new THREE.Mesh(leftFenderGeo, this.materials.body);
        leftFender.position.set(-0.9, 0.85, 1.6);
        leftFender.castShadow = true;
        group.add(leftFender);
        
        // Side panels - right front fender
        const rightFender = leftFender.clone();
        rightFender.position.set(0.9, 0.85, 1.6);
        group.add(rightFender);
        
        // Side panels - left rear fender
        const leftRearFenderGeo = new THREE.BoxGeometry(0.15, 0.65, 1.3);
        const leftRearFender = new THREE.Mesh(leftRearFenderGeo, this.materials.body);
        leftRearFender.position.set(-0.9, 0.85, -1.6);
        leftRearFender.castShadow = true;
        group.add(leftRearFender);
        
        // Side panels - right rear fender
        const rightRearFender = leftRearFender.clone();
        rightRearFender.position.set(0.9, 0.85, -1.6);
        group.add(rightRearFender);
        
        // Side skirts
        const sideSkirtGeo = new THREE.BoxGeometry(0.1, 0.15, 2.5);
        const leftSkirt = new THREE.Mesh(sideSkirtGeo, this.materials.body);
        leftSkirt.position.set(-0.88, 0.3, 0);
        group.add(leftSkirt);
        
        const rightSkirt = leftSkirt.clone();
        rightSkirt.position.set(0.88, 0.3, 0);
        group.add(rightSkirt);
        
        // Door panels - left front
        const frontDoorGeo = new THREE.BoxGeometry(0.1, 0.75, 1.0);
        const leftFrontDoor = new THREE.Mesh(frontDoorGeo, this.materials.body);
        leftFrontDoor.position.set(-0.88, 0.95, 0.6);
        leftFrontDoor.castShadow = true;
        group.add(leftFrontDoor);
        
        // Door panels - right front
        const rightFrontDoor = leftFrontDoor.clone();
        rightFrontDoor.position.set(0.88, 0.95, 0.6);
        group.add(rightFrontDoor);
        
        // Door panels - left rear
        const rearDoorGeo = new THREE.BoxGeometry(0.1, 0.75, 1.0);
        const leftRearDoor = new THREE.Mesh(rearDoorGeo, this.materials.body);
        leftRearDoor.position.set(-0.88, 0.95, -0.5);
        leftRearDoor.castShadow = true;
        group.add(leftRearDoor);
        
        // Door panels - right rear
        const rightRearDoor = leftRearDoor.clone();
        rightRearDoor.position.set(0.88, 0.95, -0.5);
        group.add(rightRearDoor);
        
        // Door handles
        const handleGeo = new THREE.BoxGeometry(0.05, 0.05, 0.15);
        const handleMat = this.materials.chrome;
        
        // Left front handle
        const lfHandle = new THREE.Mesh(handleGeo, handleMat);
        lfHandle.position.set(-0.95, 1.05, 0.7);
        group.add(lfHandle);
        
        // Right front handle
        const rfHandle = new THREE.Mesh(handleGeo, handleMat);
        rfHandle.position.set(0.95, 1.05, 0.7);
        group.add(rfHandle);
        
        // Left rear handle
        const lrHandle = new THREE.Mesh(handleGeo, handleMat);
        lrHandle.position.set(-0.95, 1.05, -0.4);
        group.add(lrHandle);
        
        // Right rear handle
        const rrHandle = new THREE.Mesh(handleGeo, handleMat);
        rrHandle.position.set(0.95, 1.05, -0.4);
        group.add(rrHandle);
        
        // Chrome window trim
        const windowTrimGeo = new THREE.BoxGeometry(0.02, 0.02, 1.0);
        const windowTrimMat = this.materials.chrome;
        
        // Side window trim
        const leftFrontTrim = new THREE.Mesh(windowTrimGeo, windowTrimMat);
        leftFrontTrim.position.set(-0.93, 1.35, 0.6);
        group.add(leftFrontTrim);
        
        const rightFrontTrim = leftFrontTrim.clone();
        rightFrontTrim.position.set(0.93, 1.35, 0.6);
        group.add(rightFrontTrim);
        
        const leftRearTrim = new THREE.Mesh(windowTrimGeo, windowTrimMat);
        leftRearTrim.position.set(-0.93, 1.35, -0.5);
        group.add(leftRearTrim);
        
        const rightRearTrim = leftRearTrim.clone();
        rightRearTrim.position.set(0.93, 1.35, -0.5);
        group.add(rightRearTrim);
    }
    
    createCabin(group) {
        // Roof
        const roofGeo = new THREE.BoxGeometry(1.4, 0.08, 1.8);
        const roof = new THREE.Mesh(roofGeo, this.materials.body);
        roof.position.set(0, 1.55, -0.2);
        roof.castShadow = true;
        group.add(roof);
        
        // A-Pillars (left and right)
        const aPillarGeo = new THREE.BoxGeometry(0.08, 0.5, 0.15);
        
        const leftAPillar = new THREE.Mesh(aPillarGeo, this.materials.body);
        leftAPillar.position.set(-0.65, 1.35, 0.7);
        leftAPillar.rotation.z = -0.25;
        leftAPillar.rotation.x = -0.1;
        group.add(leftAPillar);
        
        const rightAPillar = new THREE.Mesh(aPillarGeo, this.materials.body);
        rightAPillar.position.set(0.65, 1.35, 0.7);
        rightAPillar.rotation.z = 0.25;
        rightAPillar.rotation.x = -0.1;
        group.add(rightAPillar);
        
        // B-Pillars
        const bPillarGeo = new THREE.BoxGeometry(0.1, 0.55, 0.12);
        
        const leftBPillar = new THREE.Mesh(bPillarGeo, this.materials.body);
        leftBPillar.position.set(-0.72, 1.3, 0.05);
        group.add(leftBPillar);
        
        const rightBPillar = new THREE.Mesh(bPillarGeo, this.materials.body);
        rightBPillar.position.set(0.72, 1.3, 0.05);
        group.add(rightBPillar);
        
        // B-Pillar chrome trim (BYD Qin Pro feature)
        const bPillarTrimGeo = new THREE.BoxGeometry(0.02, 0.5, 0.14);
        const leftBPillarTrim = new THREE.Mesh(bPillarTrimGeo, this.materials.chrome);
        leftBPillarTrim.position.set(-0.77, 1.3, 0.05);
        group.add(leftBPillarTrim);
        
        const rightBPillarTrim = leftBPillarTrim.clone();
        rightBPillarTrim.position.set(0.77, 1.3, 0.05);
        group.add(rightBPillarTrim);
        
        // C-Pillars
        const cPillarGeo = new THREE.BoxGeometry(0.1, 0.5, 0.15);
        
        const leftCPillar = new THREE.Mesh(cPillarGeo, this.materials.body);
        leftCPillar.position.set(-0.65, 1.35, -0.9);
        leftCPillar.rotation.z = 0.2;
        leftCPillar.rotation.x = 0.15;
        group.add(leftCPillar);
        
        const rightCPillar = new THREE.Mesh(cPillarGeo, this.materials.body);
        rightCPillar.position.set(0.65, 1.35, -0.9);
        rightCPillar.rotation.z = -0.2;
        rightCPillar.rotation.x = 0.15;
        group.add(rightCPillar);
    }
    
    createWindows(group) {
        // Windshield
        const windshieldGeo = new THREE.PlaneGeometry(1.3, 0.7);
        const windshield = new THREE.Mesh(windshieldGeo, this.materials.glass);
        windshield.position.set(0, 1.35, 0.75);
        windshield.rotation.x = -0.3;
        group.add(windshield);
        
        // Rear window
        const rearWindowGeo = new THREE.PlaneGeometry(1.3, 0.6);
        const rearWindow = new THREE.Mesh(rearWindowGeo, this.materials.glass);
        rearWindow.position.set(0, 1.4, -1.15);
        rearWindow.rotation.x = Math.PI + 0.2;
        rearWindow.rotation.z = Math.PI;
        group.add(rearWindow);
        
        // Left front window
        const sideWindowGeo = new THREE.PlaneGeometry(0.9, 0.4);
        const leftFrontWindow = new THREE.Mesh(sideWindowGeo, this.materials.glass);
        leftFrontWindow.position.set(-0.71, 1.35, 0.6);
        leftFrontWindow.rotation.y = -Math.PI / 2;
        group.add(leftFrontWindow);
        
        // Right front window
        const rightFrontWindow = leftFrontWindow.clone();
        rightFrontWindow.position.set(0.71, 1.35, 0.6);
        rightFrontWindow.rotation.y = Math.PI / 2;
        group.add(rightFrontWindow);
        
        // Left rear window
        const leftRearWindow = new THREE.Mesh(sideWindowGeo, this.materials.glass);
        leftRearWindow.position.set(-0.71, 1.35, -0.5);
        leftRearWindow.rotation.y = -Math.PI / 2;
        group.add(leftRearWindow);
        
        // Right rear window
        const rightRearWindow = leftRearWindow.clone();
        rightRearWindow.position.set(0.71, 1.35, -0.5);
        rightRearWindow.rotation.y = Math.PI / 2;
        group.add(rightRearWindow);
        
        // Small rear quarter windows
        const quarterWindowGeo = new THREE.PlaneGeometry(0.4, 0.35);
        const leftQuarterWindow = new THREE.Mesh(quarterWindowGeo, this.materials.glass);
        leftQuarterWindow.position.set(-0.7, 1.38, -0.95);
        leftQuarterWindow.rotation.y = -Math.PI / 2;
        leftQuarterWindow.rotation.z = 0.1;
        group.add(leftQuarterWindow);
        
        const rightQuarterWindow = leftQuarterWindow.clone();
        rightQuarterWindow.position.set(0.7, 1.38, -0.95);
        rightQuarterWindow.rotation.y = Math.PI / 2;
        rightQuarterWindow.rotation.z = -0.1;
        group.add(rightQuarterWindow);
    }
    
    createWheels(group) {
        const wheelRadius = 0.35;
        const wheelWidth = 0.25;
        
        // Wheel geometry
        const tireGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 32);
        tireGeo.rotateZ(Math.PI / 2);
        
        const rimGeo = new THREE.CylinderGeometry(wheelRadius * 0.6, wheelRadius * 0.6, wheelWidth * 1.05, 16);
        rimGeo.rotateZ(Math.PI / 2);
        
        // Wheel positions
        const wheelPositions = [
            { x: -0.85, y: 0.35, z: 1.4, name: 'leftFront' },
            { x: 0.85, y: 0.35, z: 1.4, name: 'rightFront' },
            { x: -0.85, y: 0.35, z: -1.4, name: 'leftRear' },
            { x: 0.85, y: 0.35, z: -1.4, name: 'rightRear' }
        ];
        
        wheelPositions.forEach(pos => {
            const wheelGroup = new THREE.Group();
            
            // Tire
            const tire = new THREE.Mesh(tireGeo, this.materials.tire);
            tire.castShadow = true;
            wheelGroup.add(tire);
            
            // Rim
            const rim = new THREE.Mesh(rimGeo, this.materials.rim);
            wheelGroup.add(rim);
            
            // Spokes (simplified)
            const spokeGeo = new THREE.BoxGeometry(wheelRadius * 1.1, wheelWidth * 1.1, 0.05);
            const spoke1 = new THREE.Mesh(spokeGeo, this.materials.rim);
            wheelGroup.add(spoke1);
            
            const spoke2 = new THREE.Mesh(spokeGeo, this.materials.rim);
            spoke2.rotation.x = Math.PI / 2;
            wheelGroup.add(spoke2);
            
            // Center cap
            const capGeo = new THREE.CylinderGeometry(0.08, 0.08, wheelWidth * 1.1, 16);
            capGeo.rotateZ(Math.PI / 2);
            const cap = new THREE.Mesh(capGeo, this.materials.chrome);
            wheelGroup.add(cap);
            
            wheelGroup.position.set(pos.x, pos.y, pos.z);
            wheelGroup.name = pos.name + 'Wheel';
            group.add(wheelGroup);
        });
    }
    
    createLights(group) {
        // Headlights
        const headlightGeo = new THREE.BoxGeometry(0.35, 0.15, 0.1);
        
        const leftHeadlight = new THREE.Mesh(headlightGeo, this.materials.headlight);
        leftHeadlight.position.set(-0.55, 0.85, 2.26);
        leftHeadlight.rotation.y = -0.1;
        group.add(leftHeadlight);
        
        const rightHeadlight = new THREE.Mesh(headlightGeo, this.materials.headlight);
        rightHeadlight.position.set(0.55, 0.85, 2.26);
        rightHeadlight.rotation.y = 0.1;
        group.add(rightHeadlight);
        
        // LED strip (characteristic of BYD Qin Pro)
        const ledStripGeo = new THREE.BoxGeometry(1.4, 0.03, 0.05);
        const ledStrip = new THREE.Mesh(ledStripGeo, this.materials.headlight);
        ledStrip.position.set(0, 0.95, 2.28);
        group.add(ledStrip);
        
        // BYD Logo area
        const logoAreaGeo = new THREE.BoxGeometry(0.3, 0.1, 0.05);
        const logoArea = new THREE.Mesh(logoAreaGeo, this.materials.chrome);
        logoArea.position.set(0, 0.85, 2.28);
        group.add(logoArea);
        
        // Taillights
        const taillightGeo = new THREE.BoxGeometry(0.35, 0.15, 0.08);
        
        const leftTaillight = new THREE.Mesh(taillightGeo, this.materials.taillight);
        leftTaillight.position.set(-0.55, 0.95, -2.26);
        leftTaillight.rotation.y = 0.1;
        group.add(leftTaillight);
        
        const rightTaillight = new THREE.Mesh(taillightGeo, this.materials.taillight);
        rightTaillight.position.set(0.55, 0.95, -2.26);
        rightTaillight.rotation.y = -0.1;
        group.add(rightTaillight);
        
        // Rear light bar (connected taillights - modern design feature)
        const lightBarGeo = new THREE.BoxGeometry(1.2, 0.04, 0.04);
        const lightBar = new THREE.Mesh(lightBarGeo, this.materials.taillight);
        lightBar.position.set(0, 0.95, -2.28);
        group.add(lightBar);
        
        // Turn signals (front)
        const turnSignalGeo = new THREE.BoxGeometry(0.1, 0.12, 0.05);
        const turnSignalMat = new THREE.MeshStandardMaterial({
            color: 0xffaa00,
            emissive: 0xffaa00,
            emissiveIntensity: 0.3
        });
        
        const leftTurnSignal = new THREE.Mesh(turnSignalGeo, turnSignalMat);
        leftTurnSignal.position.set(-0.85, 0.8, 2.1);
        leftTurnSignal.rotation.y = -0.3;
        group.add(leftTurnSignal);
        
        const rightTurnSignal = new THREE.Mesh(turnSignalGeo, turnSignalMat);
        rightTurnSignal.position.set(0.85, 0.8, 2.1);
        rightTurnSignal.rotation.y = 0.3;
        group.add(rightTurnSignal);
    }
    
    createDetails(group) {
        // Front grille (simplified - BYD Qin Pro has distinctive grille)
        const grilleGeo = new THREE.BoxGeometry(1.2, 0.25, 0.05);
        const grille = new THREE.Mesh(grilleGeo, this.materials.plastic);
        grille.position.set(0, 0.55, 2.3);
        group.add(grille);
        
        // Chrome grille trim
        const grilleTrimGeo = new THREE.BoxGeometry(1.25, 0.03, 0.06);
        const grilleTrimTop = new THREE.Mesh(grilleTrimGeo, this.materials.chrome);
        grilleTrimTop.position.set(0, 0.68, 2.3);
        group.add(grilleTrimTop);
        
        const grilleTrimBottom = new THREE.Mesh(grilleTrimGeo, this.materials.chrome);
        grilleTrimBottom.position.set(0, 0.42, 2.3);
        group.add(grilleTrimBottom);
        
        // Side mirrors
        const mirrorGeo = new THREE.BoxGeometry(0.25, 0.18, 0.12);
        
        const leftMirror = new THREE.Mesh(mirrorGeo, this.materials.body);
        leftMirror.position.set(-0.95, 1.15, 0.9);
        leftMirror.rotation.y = 0.2;
        group.add(leftMirror);
        
        // Mirror base
        const mirrorBaseGeo = new THREE.BoxGeometry(0.08, 0.05, 0.15);
        const leftMirrorBase = new THREE.Mesh(mirrorBaseGeo, this.materials.plastic);
        leftMirrorBase.position.set(-0.9, 1.1, 0.85);
        leftMirrorBase.rotation.y = 0.3;
        group.add(leftMirrorBase);
        
        const rightMirror = new THREE.Mesh(mirrorGeo, this.materials.body);
        rightMirror.position.set(0.95, 1.15, 0.9);
        rightMirror.rotation.y = -0.2;
        group.add(rightMirror);
        
        const rightMirrorBase = new THREE.Mesh(mirrorBaseGeo, this.materials.plastic);
        rightMirrorBase.position.set(0.9, 1.1, 0.85);
        rightMirrorBase.rotation.y = -0.3;
        group.add(rightMirrorBase);
        
        // License plate areas
        const plateGeo = new THREE.BoxGeometry(0.5, 0.15, 0.02);
        const plateMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
        
        // Front plate
        const frontPlate = new THREE.Mesh(plateGeo, plateMat);
        frontPlate.position.set(0, 0.35, 2.51);
        group.add(frontPlate);
        
        // Rear plate
        const rearPlate = new THREE.Mesh(plateGeo, plateMat);
        rearPlate.position.set(0, 0.4, -2.48);
        rearPlate.rotation.y = Math.PI;
        group.add(rearPlate);
        
        // Exhaust tips (BYD Qin Pro DM has dual exhaust)
        const exhaustGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.15, 16);
        exhaustGeo.rotateZ(Math.PI / 2);
        const exhaustMat = this.materials.chrome;
        
        const leftExhaust = new THREE.Mesh(exhaustGeo, exhaustMat);
        leftExhaust.position.set(-0.4, 0.25, -2.48);
        group.add(leftExhaust);
        
        const rightExhaust = new THREE.Mesh(exhaustGeo, exhaustMat);
        rightExhaust.position.set(0.4, 0.25, -2.48);
        group.add(rightExhaust);
        
        // Fuel/Charging port (left rear fender - typical for Chinese vehicles)
        const portGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.02, 16);
        const port = new THREE.Mesh(portGeo, this.materials.body);
        port.position.set(-0.92, 0.9, -1.2);
        port.rotation.z = Math.PI / 2;
        group.add(port);
    }
}
