document.addEventListener('DOMContentLoaded', () => {
    const cursor = {
        dot: document.createElement('div'),
        circle: document.createElement('div'),
        colorCircles: [],
        lastMouseX: 0,
        lastMouseY: 0,
        isMoving: false,
        moveTimeout: null
    };

    // Add cursor elements
    cursor.dot.className = 'cursor-dot';
    cursor.circle.className = 'cursor-circle';
    document.body.appendChild(cursor.dot);
    document.body.appendChild(cursor.circle);

    // Create multiple colorful background circles
    const colors = [
        'rgba(99, 102, 241, 0.7)',    // Purple
        'rgba(16, 185, 129, 0.7)',     // Green
        'rgba(59, 130, 246, 0.7)',     // Blue
        'rgba(236, 72, 153, 0.7)',     // Pink
        'rgba(245, 158, 11, 0.7)',     // Orange
        'rgba(139, 92, 246, 0.7)',     // Violet
        'rgba(239, 68, 68, 0.7)'       // Red
    ];

    // Create 7 colorful circles with different sizes and delays
    for (let i = 0; i < 7; i++) {
        const colorCircle = document.createElement('div');
        colorCircle.className = 'cursor-color-circle';
        colorCircle.style.width = `${180 + i * 25}px`;
        colorCircle.style.height = `${180 + i * 25}px`;
        colorCircle.style.background = colors[i];
        colorCircle.style.position = 'fixed';
        colorCircle.style.borderRadius = '50%';
        colorCircle.style.filter = `blur(${70 + i * 5}px)`;
        colorCircle.style.opacity = `${0.6 - (i * 0.05)}`;
        colorCircle.style.pointerEvents = 'none';
        colorCircle.style.zIndex = '-1';
        colorCircle.style.transition = `transform ${0.2 + i * 0.08}s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease`;
        document.body.appendChild(colorCircle);
        cursor.colorCircles.push(colorCircle);
    }

    // Store previous positions for smooth animation
    let prevX = 0;
    let prevY = 0;
    
    // Track velocity for more dynamic movement
    let velocityX = 0;
    let velocityY = 0;
    let lastX = 0;
    let lastY = 0;

    // Update cursor position
    const updateCursor = (e) => {
        const posX = e.clientX;
        const posY = e.clientY;
        
        // Calculate velocity (speed and direction of movement)
        velocityX = posX - lastX;
        velocityY = posY - lastY;
        lastX = posX;
        lastY = posY;
        
        // Set moving state
        cursor.isMoving = true;
        clearTimeout(cursor.moveTimeout);
        cursor.moveTimeout = setTimeout(() => {
            cursor.isMoving = false;
        }, 100);

        // Update cursor dot immediately
        cursor.dot.style.transform = `translate(${posX - 4}px, ${posY - 4}px)`;

        // Update main cursor circle with slight delay
        cursor.circle.style.transform = `translate(${posX - 150}px, ${posY - 150}px)`;

        // Update each color circle with different delays and positions
        cursor.colorCircles.forEach((circle, index) => {
            // Calculate a position that follows the cursor with some lag
            // The higher the index, the more lag
            const circleSize = parseInt(circle.style.width) / 2;
            const lag = 0.15 + (index * 0.08); // Increasing lag for each circle
            
            // Interpolate between previous and current position with velocity influence
            const lerpFactor = cursor.isMoving ? 0.1 + (0.05 * (7 - index)) : 0.05;
            const targetX = posX - circleSize + (velocityX * (index * 0.8));
            const targetY = posY - circleSize + (velocityY * (index * 0.8));
            
            // Add some randomness to movement based on index
            const time = Date.now() / 1000;
            const offsetX = Math.sin(time * (0.5 + index * 0.1) + index * 1.5) * (8 + index * 2);
            const offsetY = Math.cos(time * (0.5 + index * 0.1) + index * 1.5) * (8 + index * 2);
            
            // Calculate rotation based on velocity
            const rotation = Math.atan2(velocityY, velocityX) * (180 / Math.PI);
            const speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
            const scale = cursor.isMoving ? 1 + (speed * 0.002) : 1;
            
            // Apply transform with easing, rotation and dynamic scaling
            circle.style.transform = `translate(${targetX + offsetX}px, ${targetY + offsetY}px) rotate(${rotation}deg) scale(${scale})`;
            circle.style.opacity = cursor.isMoving ? 0.6 - (index * 0.05) + (speed * 0.001) : 0.6 - (index * 0.05);
        });

        // Store current position for next frame
        prevX = posX;
        prevY = posY;
        
        // Update cursor's last position
        cursor.lastMouseX = posX;
        cursor.lastMouseY = posY;
    };

    // Handle cursor events
    window.addEventListener('mousemove', updateCursor);
    window.addEventListener('mouseout', () => {
        cursor.dot.style.opacity = '0';
        cursor.circle.style.opacity = '0';
        cursor.colorCircles.forEach(circle => {
            circle.style.opacity = '0';
        });
    });
    window.addEventListener('mouseover', () => {
        cursor.dot.style.opacity = '1';
        cursor.circle.style.opacity = '0.3';
        cursor.colorCircles.forEach((circle, index) => {
            circle.style.opacity = `${0.6 - (index * 0.05)}`;
            // Add a subtle scale animation when cursor returns to the window
            circle.style.transform = `translate(${cursor.lastMouseX - parseInt(circle.style.width)/2}px, ${cursor.lastMouseY - parseInt(circle.style.width)/2}px) scale(1.1)`;
            setTimeout(() => {
                circle.style.transform = `translate(${cursor.lastMouseX - parseInt(circle.style.width)/2}px, ${cursor.lastMouseY - parseInt(circle.style.width)/2}px) scale(1)`;
            }, 150 + index * 50);
        });
    });

    // Add hover effect to interactive elements
    const interactiveElements = document.querySelectorAll('a, button, input, textarea, select');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseover', () => {
            cursor.dot.style.transform = `translate(${prevX - 4}px, ${prevY - 4}px) scale(1.5)`;
            cursor.circle.style.transform = `translate(${prevX - 150}px, ${prevY - 150}px) scale(1.5)`;
            
            // Create a ripple effect with the color circles
            cursor.colorCircles.forEach((circle, index) => {
                const delay = index * 50;
                setTimeout(() => {
                    circle.style.transform = `translate(${prevX - parseInt(circle.style.width)/2}px, ${prevY - parseInt(circle.style.width)/2}px) scale(1.3)`;
                    circle.style.filter = `blur(${60 + index * 5}px)`;
                }, delay);
            });
        });
        el.addEventListener('mouseout', () => {
            cursor.dot.style.transform = `translate(${prevX - 4}px, ${prevY - 4}px) scale(1)`;
            cursor.circle.style.transform = `translate(${prevX - 150}px, ${prevY - 150}px) scale(1)`;
            
            // Reverse the ripple effect
            cursor.colorCircles.forEach((circle, index) => {
                const delay = index * 30;
                setTimeout(() => {
                    circle.style.transform = `translate(${prevX - parseInt(circle.style.width)/2}px, ${prevY - parseInt(circle.style.width)/2}px) scale(1)`;
                    circle.style.filter = `blur(${70 + index * 5}px)`;
                }, delay);
            });
        });
    });
    
    // Add a pulsing animation to the color circles when the cursor is stationary
    setInterval(() => {
        if (!cursor.isMoving) {
            cursor.colorCircles.forEach((circle, index) => {
                const scale = 1 + 0.05 * Math.sin(Date.now() / 1000 * (1 + index * 0.2));
                const currentTransform = circle.style.transform;
                if (currentTransform.includes('translate')) {
                    const translatePart = currentTransform.substring(0, currentTransform.lastIndexOf(')') + 1);
                    circle.style.transform = `${translatePart} scale(${scale})`;
                }
            });
        }
    }, 50);
});