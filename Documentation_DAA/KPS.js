class KPS {
    constructor() {
          const canvas = document.getElementById('canvas');
          this.ctx = canvas.getContext('2d');
          this.points = [];
          this.pointSize = 5;
          this.delay = 400;
          this.timeoutID = null;
          this.runningAlgorithm = false;
          canvas.addEventListener('click', this.handleCanvasClick.bind(this));
      }
  
      delayExecution(delay) {
          return new Promise(resolve => setTimeout(resolve, delay));
      }
  
      generatePoints() {
          clearTimeout(this.timeoutID);
          this.runningAlgorithm = false;
          const numPoints = parseInt(document.getElementById('numPoints').value);
          this.points = [];
          this.ctx.clearRect(0, 0, canvas.width, canvas.height);
          for (let i = 0; i < numPoints; i++) {
              const x = Math.random() * canvas.width;
              const y = Math.random() * canvas.height;
              this.points.push({ x, y });
              this.drawPoint(x, y); // Draw points with the current size
          }
      }
  
      async runAlgorithm() {
          if (this.runningAlgorithm) return;
          this.runningAlgorithm = true;
          clearTimeout(this.timeoutID);
          const hull = await this.computeHull(this.points, () => {
              this.runningAlgorithm = false;
          });
      }
  
      handleCanvasClick(event) {
          if (this.runningAlgorithm) return;
          clearTimeout(this.timeoutID);
          const rect = event.target.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;
          this.points.push({ x, y });
          this.drawPoint(x, y); // Draw points with the current size
      }
  
      drawPoint(x, y) {
          this.ctx.fillStyle = 'black';
          this.ctx.fillRect(x - this.pointSize / 2, y - this.pointSize / 2, this.pointSize, this.pointSize);
      }
  
      clearCanvas() {
          clearTimeout(this.timeoutID);
          this.runningAlgorithm = true;
          this.ctx.clearRect(0, 0, canvas.width, canvas.height);
          this.points = [];
      }

  
      // Method to find the median of an array
      findMedian(arr) {
          arr.sort((a, b) => a - b);
          return arr[Math.floor(arr.length / 2)];
      }
  
      // Method to partition array
      partition(arr, l, r, x) {
          let i;
          for (i = l; i < r; i++)
              if (arr[i] === x)
                  break;
          [arr[i], arr[r]] = [arr[r], arr[i]];
  
          i = l;
          for (let j = l; j <= r - 1; j++) {
              if (arr[j] <= x) {
                  [arr[i], arr[j]] = [arr[j], arr[i]];
                  i++;
              }
          }
          [arr[i], arr[r]] = [arr[r], arr[i]];
          return i;
      }
  
      // Method to find kth smallest element in array
      kthSmallest(arr, l, r, k) {
          if (k > 0 && k <= r - l + 1) {
              const n = r - l + 1;
              let i;
              const median = [];
              for (i = 0; i < n / 5; i++)
                  median.push(this.findMedian(arr.slice(l + i * 5, l + i * 5 + 5)));
              if (i * 5 < n){
                  median.push(this.findMedian(arr.slice(l + i * 5, l + i * 5 + n % 5)));
                  i++;
              }    
  
              const medOfMed = (i === 1) ? median[i - 1] : this.kthSmallest(median, 0, i - 1, Math.floor(i / 2));
  
              const pos = this.partition(arr, l, r, medOfMed);
  
              if (pos - l === k - 1)
                  return arr[pos];
              if (pos - l > k - 1)
                  return this.kthSmallest(arr, l, pos - 1, k);
              return this.kthSmallest(arr, pos + 1, r, k - pos + l - 1);
          }
          return Number.MAX_SAFE_INTEGER;
      }
  
      get_T(p1, p2, points, flag) {
          let upper_T = [];
          let slope = (p1.y - p2.y) / (p1.x - p2.x);
      
          for (let i = 0; i < points.length; i++) {
              let curr_point = points[i];
      
              if (curr_point.x > p1.x && curr_point.x < p2.x) {
                  let curr_slope = (p1.y - curr_point.y) / (p1.x - curr_point.x);
                  if (!flag) {
                      if (curr_slope > slope) {
                          upper_T.push(curr_point);
                      }
                  } else {
                      if (curr_slope < slope) {
                          upper_T.push(curr_point);
                      }
                  }
              }
          }
      
          upper_T.push(p1);
          upper_T.push(p2);
      
          return upper_T;
      }
      
  
      async getUpperBridge(points, median) {
        points.sort((a, b) => a.x - b.x);
    
        let candidates = [];
        let pairs = [];
    
        // Pair up points
        if (points.length % 2 == 0) {
            for (let i = 0; i < points.length; i += 2) {
                const firstPt = points[i];
                const secondPt = points[i + 1];
                pairs.push([firstPt, secondPt]);
            }
        } else {
            candidates.push(points[0]);
            for (let i = 1; i < points.length; i += 2) {
                const firstPt = points[i];
                const secondPt = points[i + 1];
                pairs.push([firstPt, secondPt]);
            }
        }
    
        let slopes = [];
        pairs.forEach(([p1, p2]) => {
            const x1 = p1.x;
            const x2 = p2.x;
            const y1 = p1.y;
            const y2 = p2.y;
            if (x1 === x2) {
                candidates.push(y1 > y2 ? p1 : p2);
                slopes.push(Number.MAX_VALUE);
            } else {
                const slope = (y2 - y1) / (x2 - x1);
                slopes.push(slope);
            }
        });
    
        let arr = slopes.filter(slope => slope !== Number.MAX_VALUE);
        let medianSlope;
        if (arr.length === 1)
            medianSlope = arr[0];
        else
            medianSlope = this.kthSmallest(arr, 0, arr.length - 1, Math.floor((arr.length + 1) / 2));
    
        let SMALL = [];
        let EQUAL = [];
        let LARGE = [];
    
        for (let i = 0; i < pairs.length; i++) {
            const [p1, p2] = pairs[i];
            const x1 = p1.x;
            const x2 = p2.x;
            const y1 = p1.y;
            const y2 = p2.y;
            if (x1 !== x2) {
                const slope = (y2 - y1) / (x2 - x1);
                if (Math.abs(slope - medianSlope) < 0.001)
                    EQUAL.push([p1, p2]);
                else if (slope < medianSlope)
                    SMALL.push([p1, p2]);
                else if (slope > medianSlope)
                    LARGE.push([p1, p2]);
            }
        }
    
        let maxC = Number.MIN_SAFE_INTEGER;
        points.forEach(point => {
            const x = point.x;
            const y = point.y;
            const currC = y - medianSlope * x;
            if (currC > maxC)
                maxC = currC;
        });
    
        let pMin = { x: Number.MAX_SAFE_INTEGER, y: Number.MAX_SAFE_INTEGER };
        let pMax = { x: Number.MIN_SAFE_INTEGER, y: Number.MIN_SAFE_INTEGER };
    
        points.forEach(point => {
            const x = point.x;
            const y = point.y;
            const currC = y - medianSlope * x;
            if (Math.abs(currC - maxC) < 0.001) {
                if (x < pMin.x)
                    pMin = { x, y };
                if (x > pMax.x)
                    pMax = { x, y };
            }
        });
    
        if (pMin.x <= median && pMax.x > median) {
            return [pMin, pMax];
        } else if (pMax.x <= median) {
            for (let i = 0; i < EQUAL.length; i++)
                candidates.push(EQUAL[i][1]);
            for (let i = 0; i < LARGE.length; i++)
                candidates.push(LARGE[i][1]);
            for (let i = 0; i < SMALL.length; i++) {
                candidates.push(SMALL[i][1]);
                candidates.push(SMALL[i][0]);
            }
            this.visualizeSlopes(points, medianSlope, SMALL, LARGE, EQUAL);
            await this.delayExecution(this.delay);
            return await this.getUpperBridge(candidates, median);
        } else if (pMin.x > median) {
            for (let i = 0; i < EQUAL.length; i++)
                candidates.push(EQUAL[i][0]);
            for (let i = 0; i < LARGE.length; i++) {
                candidates.push(LARGE[i][1]);
                candidates.push(LARGE[i][0]);
            }
            for (let i = 0; i < SMALL.length; i++)
                candidates.push(SMALL[i][0]);
            this.visualizeSlopes(points, medianSlope, SMALL, LARGE, EQUAL);
            await this.delayExecution(this.delay);
            return await this.getUpperBridge(candidates, median);
        }
    }
    
    visualizeSlopes(points, medianSlope, SMALL, LARGE, EQUAL) {
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
    
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        // Draw points
        ctx.fillStyle = 'black';
        points.forEach(point => {
            ctx.fillRect(point.x - this.pointSize / 2, point.y - this.pointSize / 2, this.pointSize, this.pointSize);
        });
    
        // Visualize SMALL points
        ctx.fillStyle = 'green';
        SMALL.forEach(([p1, p2]) => {
            ctx.fillRect(p1.x - this.pointSize / 2, p1.y - this.pointSize / 2, this.pointSize, this.pointSize);
            ctx.fillRect(p2.x - this.pointSize / 2, p2.y - this.pointSize / 2, this.pointSize, this.pointSize);
        });
    
        // Visualize LARGE points
        ctx.fillStyle = 'red';
        LARGE.forEach(([p1, p2]) => {
            ctx.fillRect(p1.x - this.pointSize / 2, p1.y - this.pointSize / 2, this.pointSize, this.pointSize);
            ctx.fillRect(p2.x - this.pointSize / 2, p2.y - this.pointSize / 2, this.pointSize, this.pointSize);
        });
    
        // Visualize EQUAL points
        ctx.fillStyle = 'blue';
        EQUAL.forEach(([p1, p2]) => {
            ctx.fillRect(p1.x - this.pointSize / 2, p1.y - this.pointSize / 2, this.pointSize, this.pointSize);
            ctx.fillRect(p2.x - this.pointSize / 2, p2.y - this.pointSize / 2, this.pointSize, this.pointSize);
        });
    
        // Draw median slope
        ctx.strokeStyle = 'black';
        ctx.beginPath();
        ctx.moveTo(0, medianSlope * 0 - 0);
        ctx.lineTo(canvas.width, medianSlope * (canvas.width) - 0);
        ctx.stroke();
    }
    
      
  
      async getLowerBridge(points, median) {
          points.sort((a, b) => a.x - b.x);
  
          let candidates = [];
          let pairs = [];
      
          // Pair up points
          if(points.length%2==0){
          for (let i = 0; i < points.length; i += 2) {
              const firstPt = points[i];
              const secondPt = points[i + 1];
              pairs.push([firstPt, secondPt]);
          }
      }
          else{
              candidates.push(points[0]);
              for (let i = 1; i < points.length; i += 2) {
                  const firstPt = points[i];
                  const secondPt = points[i + 1];
                  pairs.push([firstPt, secondPt]);
              }
          }
      
          let slopes = [];
          pairs.forEach(([p1, p2]) => {
              const x1 = p1.x;
              const x2 = p2.x;
              const y1 = p1.y;
              const y2 = p2.y;
              if (x1 === x2) {
                  candidates.push(y1 > y2 ? p2 : p1);
                  slopes.push(Number.MAX_VALUE);
              } else {
                  const slope = (y2 - y1) / (x2 - x1);
                  slopes.push(slope);
              }
          });
      
          let arr = slopes.filter(slope => slope !== Number.MAX_VALUE);
          let medianSlope;
          if (arr.length === 1)
              medianSlope = arr[0];
          else
              medianSlope = this.kthSmallest(arr, 0, arr.length - 1, Math.floor((arr.length + 1) / 2));
      
          let SMALL = [];
          let EQUAL = [];
          let LARGE = [];
      
          for (let i = 0; i < pairs.length; i++) {
              const [p1, p2] = pairs[i];
              const x1 = p1.x;
              const x2 = p2.x;
              const y1 = p1.y;
              const y2 = p2.y;
              if (x1 !== x2) {
                  const slope = (y2 - y1) / (x2 - x1);
                  if (Math.abs(slope - medianSlope) < 0.001)
                      EQUAL.push([p1, p2]);
                  else if (slope < medianSlope)
                      SMALL.push([p1, p2]);
                  else if (slope > medianSlope)
                      LARGE.push([p1, p2]);
              }
          }
      
          let minC = Number.MAX_SAFE_INTEGER;
          points.forEach(point => {
              const x = point.x;
              const y = point.y;
              const currC = y - medianSlope * x;
              if (currC < minC)
                  minC = currC;
          });
      
          let pMin = { x: Number.MAX_SAFE_INTEGER, y: Number.MAX_SAFE_INTEGER };
          let pMax = { x: Number.MIN_SAFE_INTEGER, y: Number.MIN_SAFE_INTEGER };
      
          points.forEach(point => {
              const x = point.x;
              const y = point.y;
              const currC = y - medianSlope * x;
              if (Math.abs(currC - minC) < 0.001) {
                  if (x < pMin.x)
                      pMin = { x, y };
                  if (x > pMax.x)
                      pMax = { x, y };
              }
          });
      
          if (pMin.x <= median && pMax.x > median)
              return [pMin, pMax];
          else if (pMax.x <= median) {
              for (let i = 0; i < EQUAL.length; i++)
                  candidates.push(EQUAL[i][1]);
              for (let i = 0; i < LARGE.length; i++){
                  candidates.push(LARGE[i][0]);
                  candidates.push(LARGE[i][1]);
              }    
              for (let i = 0; i < SMALL.length; i++)
                  candidates.push(SMALL[i][1]);
              this.visualizeSlopes(points, medianSlope, SMALL, LARGE, EQUAL);
              await this.delayExecution(this.delay);
              return this.getLowerBridge(candidates, median);
          } else if (pMin.x > median) {
              for (let i = 0; i < EQUAL.length; i++)
                  candidates.push(EQUAL[i][0]);
              for (let i = 0; i < LARGE.length; i++)
                  candidates.push(LARGE[i][0]);
              for (let i = 0; i < SMALL.length; i++){
                  candidates.push(SMALL[i][0]);
                  candidates.push(SMALL[i][1]);
              }    
              this.visualizeSlopes(points, medianSlope, SMALL, LARGE, EQUAL);
              await this.delayExecution(this.delay);
              return this.getLowerBridge(candidates, median);
          }
      }
      
  
      // Method to get the upper hull
      async getUpperHull(pmin, pmax, points) {
          let upperHull = [];
          let n = points.length;
          let arr = [];
          for (let i = 0; i < n; i++) {
              arr.push(points[i].x);
          }
      
          let median;
          if (n === 1)
              median = arr[0];
          else
              median = this.kthSmallest(arr, 0, n - 1, Math.floor((n + 1) / 2));
      
          let upperBridge = await this.getUpperBridge(points, median);
          let pl = upperBridge[0];
          let pr = upperBridge[1];
      
          if (pl.x > pr.x) {
              [pl, pr] = [pr, pl];
          }
      
          upperHull.push(pl);
          upperHull.push(pr);
      
          // Visualize the initial upper bridge
          this.visualizeBridge([pl, pr], 'orange');
          await this.delayExecution(this.delay);
      
          if (!(pmin.x == pl.x && pmin.y == pl.y)) {
              let upperTLeft = this.get_T(pmin, pl, points, false);
              const left = await this.getUpperHull(pmin, pl, upperTLeft);
              upperHull = upperHull.concat(left);
          }
      
          if (!(pmax.x == pr.x && pmax.y == pr.y)) {
              let upperTRight = this.get_T(pr, pmax, points, false);
              const right = await this.getUpperHull(pr, pmax, upperTRight);
              upperHull = upperHull.concat(right);
          }
      
          // Visualize the final upper hull
          this.visualizeBridge(upperHull);
          await this.delayExecution(500);
      
          return upperHull;
      }
       
      visualizePoints(points, color = 'black') {
          const canvas = document.getElementById('canvas');
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = color;
          for (let i = 0; i < points.length; i++) {
              const point = points[i];
              ctx.fillRect(point.x - this.pointSize / 2, point.y - this.pointSize / 2, this.pointSize, this.pointSize);
          }
      }
      
      async visualizeBridge(bridge, color) {
          const canvas = document.getElementById('canvas');
          const ctx = canvas.getContext('2d');
          ctx.strokeStyle = color;
          ctx.beginPath();
          ctx.moveTo(bridge[0].x, bridge[0].y);
          ctx.lineTo(bridge[1].x, bridge[1].y);
          ctx.stroke();
      }
      
      async visualizeUpper(upperHull, color) {
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw points
        ctx.fillStyle = 'black';
        this.points.forEach(point => {
            ctx.fillRect(point.x - this.pointSize / 2, point.y - this.pointSize / 2, this.pointSize, this.pointSize);
        });

        // Draw upper hull
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(upperHull[0].x, upperHull[0].y);
        for (let i = 1; i < upperHull.length; i++) {
            ctx.lineTo(upperHull[i].x, upperHull[i].y);
        }
        //ctx.closePath();
        ctx.stroke();
    }

    async visualizeLower(lowerHull, color) {
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw points
        ctx.fillStyle = 'black';
        this.points.forEach(point => {
            ctx.fillRect(point.x - this.pointSize / 2, point.y - this.pointSize / 2, this.pointSize, this.pointSize);
        });

        // Draw lower hull
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(lowerHull[0].x, lowerHull[0].y);
        for (let i = 1; i < lowerHull.length; i++) {
            ctx.lineTo(lowerHull[i].x, lowerHull[i].y);
        }
        //ctx.closePath();
        ctx.stroke();
    }

      async getLowerHull(pmin, pmax, points) {
          let lowerHull = [];
          let n = points.length;
          let arr = [];
          for (let i = 0; i < n; i++) {
              arr.push(points[i].x);
          }
          let median;
          if (n === 1)
              median = arr[0];
          else
              median = this.kthSmallest(arr, 0, n - 1, Math.floor((n + 1) / 2));
          let lowerBridge = await this.getLowerBridge(points, median);
          let pl = lowerBridge[0];
          let pr = lowerBridge[1];
      
          if (pl.x > pr.x) {
              [pl, pr] = [pr, pl];
          }
      
          lowerHull.push(pl);
          lowerHull.push(pr);
      
          // Visualize the initial lower bridge
          this.visualizeBridge([pl, pr], 'green');
          await this.delayExecution(this.delay);
      
          if (!(pmin.x == pl.x && pmin.y == pl.y)) {
              let lowerTLeft = this.get_T(pmin, pl, points, true);
              const left = await this.getLowerHull(pmin, pl, lowerTLeft);
              lowerHull = lowerHull.concat(left);
          }
      
          if (!(pmax.x == pr.x && pmax.y == pr.y)) {
              let lowerTRight = this.get_T(pr, pmax, points, true);
              const right = await this.getLowerHull(pr, pmax, lowerTRight);
              lowerHull = lowerHull.concat(right);
          }
      
          // Visualize the final lower hull
          this.visualizeBridge(lowerHull, 'green');
          await this.delayExecution(500);
          return lowerHull;

      }
      
      // Method to compute the convex hull
      async computeHull() {
          if (this.points.length < 3) {
              console.log("Hull doesn't exist!!");
              return [];
          }
      
          let pmin_u, pmin_l, pmax_u, pmax_l;
      
          pmin_l = pmin_u = pmax_u = pmax_l = this.points[0];
          for (let i = 1; i < this.points.length; i++) {
              const currPoint = this.points[i];
              if (currPoint.x < pmin_l.x) {
                  pmin_l = currPoint;
                  pmin_u = currPoint;
              } else if (currPoint.x > pmax_l.x) {
                  pmax_l = currPoint;
                  pmax_u = currPoint;
              } else if (currPoint.x === pmin_l.x) {
                  if (currPoint.y > pmin_u.y) {
                      pmin_u = currPoint;
                  } else if (currPoint.y < pmin_l.y) {
                      pmin_l = currPoint;
                  }
              } else if (currPoint.x === pmax_l.x) {
                  if (currPoint.y > pmax_u.y) {
                      pmax_u = currPoint;
                  } else if (currPoint.y < pmax_l.y) {
                      pmax_l = currPoint;
                  }
              }
          }
      
          const upperT = this.get_T(pmin_u, pmax_u, this.points, false);
          const upperHull = await this.getUpperHull(pmin_u, pmax_u, upperT);
          const lowerT = this.get_T(pmin_l, pmax_l, this.points, true);
          const lowerHull = await this.getLowerHull(pmin_l, pmax_l, lowerT);
          console.log(upperHull);
        const upperHullUn = [];
        for (const point of upperHull) {
        if (!upperHullUn.some(p => p.x === point.x && p.y === point.y)) {
            upperHullUn.push(point);
            }
        }
        const lowerHullUn = [];
        for (const point of lowerHull) {
        if (!lowerHullUn.some(p => p.x === point.x && p.y === point.y)) {
        lowerHullUn.push(point);
        }
        }

          await this.visualizeUpper(upperHullUn, 'orange');
          await this.visualizeLower(lowerHullUn, 'green');
          console.log(lowerHull);
          let hullEdges = [...upperHull, ...lowerHull];
    
          if (!(pmin_u.x == pmin_l.x && pmin_u.y == pmin_l.y)) {
              hullEdges.push(pmin_l);
              hullEdges.push(pmin_u);
          }
          if (!(pmax_l.x == pmax_u.x && pmax_l.y == pmax_u.y)) {
              hullEdges.push(pmax_l);
              hullEdges.push(pmax_u);
          }
      
          hullEdges.sort((a, b) => {
              if (a.x < b.x) return -1;
              if (a.x > b.x) return 1;
              if (a.y < b.y) return -1;
              if (a.y > b.y) return 1;
              return 0;
          });
      
          let hull = [];
          hull.push(hullEdges[0]);
          for (let i = 1; i < hullEdges.length; i++) {
              if (!(hullEdges[i].x == hullEdges[i - 1].x && hullEdges[i].y == hullEdges[i - 1].y)) {
                  hull.push(hullEdges[i]);
              }
          }
          this.visualizeHull(hull);
          return hull;
      }
  
  
      // Method to visualize the convex hull
      visualizeHull(hull) {
      const canvas = document.getElementById('canvas');
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;
  
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
  
      // Find centroid of the hull
      let centroidX = 0;
      let centroidY = 0;
      for (let i = 0; i < hull.length; i++) {
          centroidX += hull[i].x;
          centroidY += hull[i].y;
      }
      centroidX /= hull.length;
      centroidY /= hull.length;
  
      // Sort the points based on polar angle from centroid
      hull.sort((a, b) => {
          const angleA = Math.atan2(a.y - centroidY, a.x - centroidX);
          const angleB = Math.atan2(b.y - centroidY, b.x - centroidX);
          return angleA - angleB;
      });
  
      // Draw points
      ctx.fillStyle = 'black';
      for (let i = 0; i < this.points.length; i++) {
          const point = this.points[i];
          this.drawPoint(point.x, point.y);
      }
  
      // Draw convex hull with animation
      ctx.strokeStyle = 'red';
      ctx.beginPath();
      ctx.moveTo(hull[0].x, hull[0].y);
  
      let i = 1;
      const animateStep = () => {
          if (i < hull.length) {
              ctx.lineTo(hull[i].x, hull[i].y);
              ctx.stroke();
              i++;
              setTimeout(animateStep, 100); 
          } else {
              ctx.closePath();
              ctx.stroke();
          }
      };
  
      animateStep();
  }
  
  }