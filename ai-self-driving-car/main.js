const carCanvas = document.getElementById("carCanvas");
carCanvas.width = 200;
const networkCanvas = document.getElementById("networkCanvas");
networkCanvas.width = 300;
// momento aula 2:18:54
const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);
const N = 300;
const cars = generateCars(N);
let bestCar = cars[0];
const storedBestBrain = localStorage.getItem("bestBrain");
if (storedBestBrain) {
  cars.forEach((car, i) => {
    car.brain = JSON.parse(storedBestBrain);
    if (i) {
      NeuralNetwork.mutate(car.brain, 0.2);
    }
  });
}

const traffic = [
  new Car({
    x: road.getLaneCenter(1),
    y: -100,
    width: 30,
    height: 50,
    controlType: "DUMMY",
    maxSpeed: 1,
  }),
  new Car({
    x: road.getLaneCenter(0),
    y: -300,
    width: 30,
    height: 50,
    controlType: "DUMMY",
    maxSpeed: 2,
  }),
  new Car({
    x: road.getLaneCenter(2),
    y: -300,
    width: 30,
    height: 50,
    controlType: "DUMMY",
    maxSpeed: -1,
  }),
  new Car({
    x: road.getLaneCenter(0),
    y: -400,
    width: 30,
    height: 50,
    controlType: "DUMMY",
    maxSpeed: 2,
  }),
  new Car({
    x: road.getLaneCenter(1),
    y: -500,
    width: 30,
    height: 50,
    controlType: "DUMMY",
    maxSpeed: 2,
  }),
  new Car({
    x: road.getLaneCenter(2),
    y: -700,
    width: 30,
    height: 50,
    controlType: "DUMMY",
    maxSpeed: -1,
  }),
  new Car({
    x: road.getLaneCenter(0),
    y: -700,
    width: 30,
    height: 50,
    controlType: "DUMMY",
    maxSpeed: 1,
  }),
  new Car({
    x: road.getLaneCenter(1),
    y: -800,
    width: 30,
    height: 50,
    controlType: "DUMMY",
    maxSpeed: 1,
  }),
  new Car({
    x: road.getLaneCenter(0),
    y: -900,
    width: 30,
    height: 50,
    controlType: "DUMMY",
    maxSpeed: -2,
  }),
  new Car({
    x: road.getLaneCenter(2),
    y: -1000,
    width: 30,
    height: 50,
    controlType: "DUMMY",
    maxSpeed: 0,
  }),
  new Car({
    x: road.getLaneCenter(0),
    y: -1000,
    width: 30,
    height: 50,
    controlType: "DUMMY",
    maxSpeed: 0,
  }),
  new Car({
    x: road.getLaneCenter(1),
    y: -1100,
    width: 30,
    height: 50,
    controlType: "DUMMY",
    maxSpeed: 4,
  }),
  new Car({
    x: road.getLaneCenter(0),
    y: -1100,
    width: 30,
    height: 50,
    controlType: "DUMMY",
    maxSpeed: 1,
  }),
  new Car({
    x: road.getLaneCenter(1),
    y: -1200,
    width: 30,
    height: 50,
    controlType: "DUMMY",
    maxSpeed: 2,
  }),
  new Car({
    x: road.getLaneCenter(0),
    y: -1200,
    width: 30,
    height: 50,
    controlType: "DUMMY",
    maxSpeed: -1,
  }),
  new Car({
    x: road.getLaneCenter(0),
    y: -1400,
    width: 30,
    height: 100,
    controlType: "DUMMY",
    maxSpeed: -1,
  }),
  new Car({
    x: road.getLaneCenter(2),
    y: -1450,
    width: 30,
    height: 50,
    controlType: "DUMMY",
    maxSpeed: -1,
  }),
];

animate();

function save() {
  localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
}

function discard() {
  localStorage.removeItem("bestBrain");
}

function generateCars(n) {
  const cars = [];
  for (let i = 0; i < n; i++) {
    cars.push(
      new Car({
        x: road.getLaneCenter(1),
        y: 100,
        width: 30,
        height: 50,
        controlType: "AI",
      })
    );
  }
  return cars;
}

function animate(time) {
  for (let i = 0; i < traffic.length; i++) {
    traffic[i].update(road.borders, []);
  }
  for (let i = 0; i < cars.length; i++) {
    cars[i].update(road.borders, traffic);
  }
  bestCar = cars.find((car) => {
    return (
      car.y ===
      Math.min(
        ...cars.map((e) => {
          return e.y;
        })
      )
    );
  });
  console.log(bestCar);

  carCanvas.height = window.innerHeight;
  networkCanvas.height = window.innerHeight;

  carCtx.save();
  carCtx.translate(0, -bestCar.y + carCanvas.height * 0.7);

  road.draw(carCtx);
  for (let i = 0; i < traffic.length; i++) {
    traffic[i].draw(carCtx, "red");
  }
  carCtx.globalAlpha = 0.2;
  for (let i = 0; i < cars.length; i++) {
    cars[i].draw(carCtx, "blue");
  }
  carCtx.globalAlpha = 1;
  bestCar.draw(carCtx, "blue", true);

  carCtx.restore();

  networkCtx.lineDashOffset = -time / 50;
  Visualizer.drawNetwork(networkCtx, bestCar.brain);
  requestAnimationFrame(animate);
}
