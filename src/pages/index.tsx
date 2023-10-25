import Matter, { World } from 'matter-js';

type CategoryKeys = 'red' | 'green' | 'blue';

interface Category {
  color: string;
  radius: number;
  categoryBit: number;
}

type Categories = Record<CategoryKeys, Category>;

const Home = () => {
  const mainFunc = () => {
    // Matter.jsの設定と初期化
    const Engine = Matter.Engine,
      Render = Matter.Render,
      Composite = Matter.Composite,
      MouseConstraint = Matter.MouseConstraint,
      Mouse = Matter.Mouse,
      Events = Matter.Events,
      Bodies = Matter.Bodies;

    const engine = Engine.create(),
      world = engine.world;

    const render = Render.create({
      element: document.body,
      engine,
      options: {
        width: 800,
        height: 600,
        wireframes: false,
      },
    });

    Render.run(render);

    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    const defaultCategory = 0x0001;

    const categories: Categories = {
      red: {
        categoryBit: 0x0002,
        radius: 10,
        color: '#FF0000',
      },
      green: {
        categoryBit: 0x0004,
        radius: 20,
        color: '#00FF00',
      },
      blue: {
        categoryBit: 0x0008,
        radius: 30,
        color: '#0000FF',
      },
    };

    Composite.add(
      world,
      Bodies.rectangle(400, 600, 900, 50, {
        collisionFilter: {
          category: defaultCategory,
        },
        isStatic: true,
        render: { fillStyle: 'transparent', lineWidth: 1 },
      })
    );

    const createBall = (x: number, y: number, category: Category) => {
      Composite.add(
        world,
        Bodies.circle(x, y, category.radius, {
          collisionFilter: {
            mask: defaultCategory || category.categoryBit,
          },
          render: {
            fillStyle: category.color,
          },
        })
      );
    };

    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: {
        stiffness: 0.2,
        render: {
          visible: false,
        },
      },
      collisionFilter: {
        category: 0x0000,
      },
    });
    Composite.add(world, mouseConstraint);

    Events.on(mouseConstraint, 'mousedown', (event: any) => {
      const mousePosition = event.mouse.position;
      const random = Math.floor(Math.random() * 3);
      if (random === 0) {
        createBall(mousePosition.x, 10, categories.red);
      } else if (random === 1) {
        createBall(mousePosition.x, 10, categories.green);
      } else {
        createBall(mousePosition.x, 10, categories.blue);
      }
    });

    render.mouse = mouse;

    Events.on(engine, 'collisionStart', (event) => {
      event.pairs.forEach((pair) => {
        console.log(pair.bodyA.collisionFilter.category?.toString(2));
        const { bodyA, bodyB } = pair;

        if (
          bodyA.collisionFilter.category !== defaultCategory &&
          bodyB.collisionFilter.category !== defaultCategory
        ) {
          console.log(bodyA.collisionFilter.category?.toString(2));
          console.log(bodyB.collisionFilter.category?.toString(2));
          if (bodyA.collisionFilter.category === bodyB.collisionFilter.category) {
            World.remove(world, bodyA);
            World.remove(world, bodyB);

            const x = (bodyA.position.x + bodyB.position.x) / 2;
            const y = (bodyA.position.y + bodyB.position.y) / 2;
            createBall(x, y, categories.blue);
          }
        }
      });
    });

    Render.lookAt(render, {
      min: { x: 0, y: 0 },
      max: { x: 800, y: 600 },
    });

    Engine.run(engine);
    Render.run(render);
  };

  return (
    <div>
      <h1>My Next.js app with Matter.js</h1>
      <button onClick={mainFunc}>Click Me</button>
    </div>
  );
};

export default Home;
