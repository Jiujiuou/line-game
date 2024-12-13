import { useEffect, useRef } from 'react';

const Confetti = ({ isActive }) => {
  const canvasRef = useRef(null);
  const confettiRef = useRef([]);
  const animationFrameRef = useRef();

  const colors = ['#f94144', '#f3722c', '#f8961e', '#f9c74f', '#90be6d', '#43aa8b', '#577590'];
  const particleCount = 100;

  const createParticle = () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * -window.innerHeight,
    rotation: Math.random() * 360,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: Math.random() * 10 + 5,
    speedY: Math.random() * 3 + 2,
    speedX: Math.random() * 2 - 1,
    speedRotation: (Math.random() - 0.5) * 2,
  });

  useEffect(() => {
    if (!isActive) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // 初始化彩带
    confettiRef.current = Array(particleCount)
      .fill()
      .map(() => createParticle());

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      confettiRef.current.forEach((particle, i) => {
        particle.y += particle.speedY;
        particle.x += particle.speedX;
        particle.rotation += particle.speedRotation;

        // 重置超出屏幕的彩带
        if (particle.y > canvas.height) {
          confettiRef.current[i] = createParticle();
        }

        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate((particle.rotation * Math.PI) / 180);
        ctx.fillStyle = particle.color;
        ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size / 3);
        ctx.restore();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [isActive]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    />
  );
};

export default Confetti;
