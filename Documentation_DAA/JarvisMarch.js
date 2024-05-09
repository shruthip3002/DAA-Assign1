const canvas = document.getElementById('canvas'); //to retrieve canvas from HTML document. This allows canvas element to interact with JavaScript.
const pen = canvas.getContext('2d'); //pen will be used to draw graphics on the canvas.

let points = []; // to store points on the canvas.
let delayStep = 100; // delay after each step in the algorithm.
let timeoutID;
let AlgoRun = false; // to store whether the algorithm is running or not?

function PointGeneration(){ 
    // Function to generate points in the canvas.

    clearTimeout(timeoutID); // to ensure animation stops when new points are being generated.

    AlgoRun = false;

    const numberOfPoints = parseInt(document.getElementById('numberOfPoints').value); // retrieves values from HTML Document, converts the string var to integer, to let the algo know how many points are to be generated.
    points = []; 

    pen.clearRect(0, 0, canvas.width, canvas.height); // clears the entire canvas.

    for (let i = 0; i < numberOfPoints; i++) { //generates random points.
        points.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height });
    }

    points.forEach(point => {
        // to visualize the generated points on the canvas.
        pen.fillStyle = 'black';
        pen.fillRect(point.x, point.y, 5, 5); 
    });
}

function runAlgorithm() { // function to run the algorithm.
    if (AlgoRun) return; 
    AlgoRun = true; 
    clearTimeout(timeoutID); 
    ConvexHull_GiftWrapping(points, () => {  
        AlgoRun = false; 
    });
}

canvas.addEventListener('click', function(event) { //whenever you click inside the canvas, the following function will be executed.
    if (AlgoRun) return; 
    clearTimeout(timeoutID); 
    const rect = canvas.getBoundingClientRect(); //retrieve coordinates of click event relative to the canvas.
    
    
    const x = event.clientX - rect.left; //relative to the top left position of the canvas.
    const y = event.clientY - rect.top;

    points.push({ x, y });
    pen.fillStyle = 'black';
    pen.fillRect(x - 2.5, y - 2.5, 5, 5); 
});

function clearCanvas() {
    clearTimeout(timeoutID); 
    AlgoRun = false; 
    pen.clearRect(0, 0, canvas.width, canvas.height); 
    points = [];
}

function getVector(p1, p2) {
    return [p2.x - p1.x, p2.y - p1.y];
}

function crossProduct(a, b) {
    return a[0] * b[1] - a[1] * b[0];
}

function findMaxCrossProductPoint(p, pointSet, callback) {
    // Initialize the comparison point to the first point in the set
    let comparePoint = pointSet[0];
    // Start iterating from the second point
    let i = 1;

    // Recursive function to iterate through the point set
    function step() {
        // Check if there are still points to compare
        if (i < pointSet.length) {
            // Calculate the cross product between p and the comparison point
            // and between p and the current point in the set
            if (crossProduct(getVector(p, comparePoint), getVector(p, pointSet[i])) >= 0) {
                // Update the comparison point if the cross product is positive or zero
                comparePoint = pointSet[i];
            }
            // Draw a temporary line from p to the current point on the canvas
            drawLine(p, pointSet[i], 'gray', true); 
            // Set a timeout to clear the temporary line after a delay
            timeoutID = setTimeout(() => {
                clearLine(p, pointSet[i]); 
                i++;
                // Recursively call the step function to process the next point
                step(); 
            }, delayStep);
        } else {
            // If all points have been compared, invoke the callback with the comparison point
            callback(comparePoint);
        }
    }

    // Start the algorithm by calling the step function
    step();
}



function drawLine(p1, p2, color = 'blue', temporary = false) { //function to draw the line, from one initial point to the next point.
    pen.beginPath();
    pen.moveTo(p1.x, p1.y);
    pen.lineTo(p2.x, p2.y);
    pen.strokeStyle = color;
    pen.stroke();

    if (temporary) {
        setTimeout(() => clearLine(p1, p2), delayStep / 2);
    }
}

function clearLine(p1, p2) {
    pen.beginPath();
    pen.moveTo(p1.x, p1.y);
    pen.lineTo(p2.x, p2.y);
    pen.strokeStyle = 'white';
    pen.stroke();
}

function ConvexHull_GiftWrapping(pointSet, callback) {
    let hull = [];
    // Sort the points (based on x coordinates)
    let sorted_points = [...pointSet].sort((a, b) => a.x - b.x);
    // Add the point with the smallest x-coordinate to the hull
    hull.push(sorted_points[0]);

    // Recursive function to wrap the convex hull around the point set
    function wrap(point) {
        // Check if the algorithm needs to continue wrapping the hull
        if (point !== hull[0] || hull.length === 1) {
            // Find the next point with the maximum cross product
            findMaxCrossProductPoint(hull[hull.length - 1], sorted_points, nextPoint => {
                // Add the next point to the hull
                hull.push(nextPoint);
                // Drawing line between the last two points that have been added to the hull
                drawLine(hull[hull.length - 2], nextPoint, 'red');
                // Remove the next point from the set of sorted points
                sorted_points.splice(sorted_points.indexOf(nextPoint), 1);
                // Recursively wrap the hull around the next point
                wrap(nextPoint);
            });
        } else {
            // Draw a line between the last and first points to close the hull
            drawLine(hull[hull.length - 1], hull[0], 'red');
            // to signal the completion of the algorithm.
            callback();
        }
    }

    // Start wrapping the hull around the initial point
    wrap(hull[0]);
}

