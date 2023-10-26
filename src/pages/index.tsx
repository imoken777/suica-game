import Matter, { World } from 'matter-js';

interface Category {
  color: string;
  radius: number;
  categoryBit: number;
}

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

    const categories: Category[] = [
      {
        categoryBit: 0x0002,
        radius: 10,
        color: '#FF0000',
      },
      {
        categoryBit: 0x0004,
        radius: 15,
        color: '#FFA500',
      },
      {
        categoryBit: 0x0008,
        radius: 20,
        color: '#FFFF00',
      },
      {
        categoryBit: 0x0010,
        radius: 25,
        color: '#00FF00',
      },
      {
        categoryBit: 0x0020,
        radius: 30,
        color: '#0000FF',
      },
      {
        categoryBit: 0x0040,
        radius: 35,
        color: '#4B0082',
      },
      {
        categoryBit: 0x0080,
        radius: 40,
        color: '#EE82EE',
      },
      {
        categoryBit: 0x0100,
        radius: 45,
        color: '#FFC0CB',
      },
    ];

    const getNextCategory = (currentCategoryBit: number) => {
      const currentIndex = categories.findIndex(
        (category) => category.categoryBit === currentCategoryBit
      );
      if (currentIndex === -1) return categories[0];

      const nextIndex = (currentIndex + 1) % categories.length;
      return categories[nextIndex];
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

    Composite.add(
      world,
      Bodies.rectangle(0, 300, 50, 600, {
        collisionFilter: {
          category: defaultCategory,
        },
        isStatic: true,
        render: { fillStyle: 'transparent', lineWidth: 1 },
      })
    );

    Composite.add(
      world,
      Bodies.rectangle(800, 300, 50, 600, {
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
            category: category.categoryBit,
            mask:
              defaultCategory |
              categories.map((category) => category.categoryBit).reduce((a, b) => a | b),
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
      const random = Math.floor(Math.random() * 8);
      const category = categories[random];
      createBall(mousePosition.x, mousePosition.y, category);
    });

    render.mouse = mouse;

    Events.on(engine, 'collisionStart', (event) => {
      event.pairs.forEach((pair) => {
        const { bodyA, bodyB } = pair;

        if (
          bodyA.collisionFilter.category !== defaultCategory &&
          bodyB.collisionFilter.category !== defaultCategory
        ) {
          if (bodyA.collisionFilter.category === bodyB.collisionFilter.category) {
            World.remove(world, bodyA);
            World.remove(world, bodyB);

            const x = (bodyA.position.x + bodyB.position.x) / 2;
            const y = (bodyA.position.y + bodyB.position.y) / 2;
            const nextCategory = getNextCategory(bodyA.collisionFilter.category!);
            createBall(x, y, nextCategory);
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
      <h1>スイカゲーム</h1>
      <button onClick={mainFunc}>ゲームをプレイ</button>
    </div>
  );
};

export default Home;
