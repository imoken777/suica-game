import Matter, { Bodies, Composite, Events, World } from 'matter-js';
import { useEffect, useRef, useState } from 'react';
import { categories } from '../utils/categories';
import type { Category, MyMouseEvent } from '../utils/types';

const Home = () => {
  const [readyCategory, setReadyCategory] = useState<Category>(categories[0]);
  const engineRef = useRef<Matter.Engine | null>(null);
  const worldRef = useRef<Matter.World | null>(null);
  const mouseConstraintRef = useRef<Matter.MouseConstraint | null>(null);
  const renderDivRef = useRef<HTMLDivElement | null>(null);

  const defaultCategory = 0x0001;
  const limitCategory = 0x0003;

  const getNextCategory = (currentCategoryBit: number) => {
    const currentIndex = categories.findIndex(
      (category) => category.categoryBit === currentCategoryBit
    );
    if (currentIndex === -1) return categories[0];

    const nextIndex = (currentIndex + 1) % categories.length;
    return categories[nextIndex];
  };

  const createBall = (x: number, y: number, category: Category) => {
    if (!worldRef.current) return; // worldがnullまたはundefinedの場合は何もしない
    Composite.add(
      worldRef.current,
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

  useEffect(() => {
    const Engine = Matter.Engine,
      Render = Matter.Render,
      Composite = Matter.Composite,
      MouseConstraint = Matter.MouseConstraint,
      Mouse = Matter.Mouse,
      Events = Matter.Events,
      Bodies = Matter.Bodies;

    const engine = Engine.create();
    engineRef.current = engine;
    worldRef.current = engine.world;

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const currentRenderDiv = renderDivRef.current;

    let render: Matter.Render | null = null;

    if (renderDivRef.current) {
      render = Render.create({
        element: renderDivRef.current,
        engine,
        options: {
          width: windowWidth,
          height: windowHeight,
          wireframes: false,
        },
      });
    }
    if (!render) return;
    Render.run(render);

    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    //x,y,width,height,options

    //床
    Composite.add(
      worldRef.current,
      Bodies.rectangle(windowWidth / 2, windowHeight - 10, windowWidth, 10, {
        collisionFilter: {
          category: defaultCategory,
          mask: categories.map((category) => category.categoryBit).reduce((a, b) => a | b),
        },
        isStatic: true,
        render: { fillStyle: 'red', lineWidth: 1 },
      })
    );

    // 左壁
    Composite.add(
      worldRef.current,
      Bodies.rectangle(5, windowHeight / 2, 10, windowHeight, {
        collisionFilter: {
          category: defaultCategory,
        },
        isStatic: true,
        render: { fillStyle: 'transparent', lineWidth: 1 },
      })
    );

    // 右壁
    Composite.add(
      worldRef.current,
      Bodies.rectangle(windowWidth - 5, windowHeight / 2, 10, windowHeight, {
        collisionFilter: {
          category: defaultCategory,
        },
        isStatic: true,
        render: { fillStyle: 'transparent', lineWidth: 1 },
      })
    );

    // 天井
    Composite.add(
      worldRef.current,
      Bodies.rectangle(windowWidth / 2, 5, windowWidth, 10, {
        collisionFilter: {
          category: limitCategory,
        },
        isStatic: true,
        render: { fillStyle: 'transparent', lineWidth: 1 },
      })
    );

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
    Composite.add(worldRef.current, mouseConstraint);
    mouseConstraintRef.current = mouseConstraint;

    Events.on(engine, 'collisionStart', (event) => {
      event.pairs.forEach((pair) => {
        const { bodyA, bodyB } = pair;

        if (
          bodyA.collisionFilter.category !== defaultCategory &&
          bodyB.collisionFilter.category !== defaultCategory
        ) {
          if (bodyA.collisionFilter.category === bodyB.collisionFilter.category) {
            if (worldRef.current) {
              World.remove(worldRef.current, bodyA);
              World.remove(worldRef.current, bodyB);
            }

            const x = (bodyA.position.x + bodyB.position.x) / 2;
            const y = (bodyA.position.y + bodyB.position.y) / 2;
            if (bodyA.collisionFilter.category !== undefined) {
              const nextCategory = getNextCategory(bodyA.collisionFilter.category);
              createBall(x, y, nextCategory);
            }
          }
        }
      });
    });

    Events.on(engine, 'collisionActive', (event) => {
      event.pairs.forEach((pair) => {
        const { bodyA, bodyB } = pair;

        if (
          bodyA.collisionFilter.category === limitCategory ||
          bodyB.collisionFilter.category === limitCategory
        ) {
          console.log('game over');
        }
      });
    });

    Render.lookAt(render, {
      min: { x: 0, y: 0 },
      max: { x: windowWidth, y: windowHeight },
    });

    Engine.run(engine);
    Render.run(render);

    return () => {
      if (!render) return;
      Render.stop(render);
      Matter.Runner.stop(runner);
      if (currentRenderDiv) {
        currentRenderDiv.innerHTML = '';
      }
    };
  }, []);

  useEffect(() => {
    const currentMouseConstraint = mouseConstraintRef.current;

    const mouseDownFunc = (event: MyMouseEvent) => {
      const mousePosition = event.mouse.position;
      createBall(mousePosition.x, 100, readyCategory);
      const random = Math.floor(Math.random() * 8);
      setReadyCategory(categories[random]);
    };
    if (currentMouseConstraint) {
      Events.on(currentMouseConstraint, 'mousedown', mouseDownFunc);
    }

    return () => {
      if (currentMouseConstraint) {
        Events.off(currentMouseConstraint, 'mousedown', mouseDownFunc);
      }
    };
  }, [readyCategory]);
  return (
    <div>
      <div ref={renderDivRef} />
    </div>
  );
};

export default Home;
