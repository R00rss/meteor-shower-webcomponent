class MeteorShower extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Default values
    this.meteors = 10;
    this.stars = 300;
    
    this.CONFIG = {
      METEOR_LENGTH: 200,
      TRAJECTORY_MULTIPLIER: 4,
      MIN_ROTATION: 45,
      MAX_ROTATION: 135,
      MIN_SCALE: 0.5,
      MAX_SCALE: 1.0,
      MIN_DURATION: 3,
      MAX_DURATION: 10,
      MAX_DELAY: 5,
      MIN_LEFT_PERCENT: 9,
      MAX_LEFT_PERCENT: 99,
      MIN_TOP: 50,
      MAX_TOP: 300,
      MAX_TWINKLE_DELAY: 2,
      OFF_SET_Y: 770,
      OFF_SET_X: 0,
    };

    this.MathUtils = {
      random: (min, max) => Math.random() * (max - min) + min,
      toRadians: (degrees) => degrees * (Math.PI / 180),
      randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
    };
  }

  static get observedAttributes() {
    return ['meteors', 'stars'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this[name] = parseInt(newValue) || (name === 'meteors' ? 10 : 300);
      if (this.shadowRoot.innerHTML) {
        this.render();
      }
    }
  }

  connectedCallback() {
    this.meteors = parseInt(this.getAttribute('meteors')) || 10;
    this.stars = parseInt(this.getAttribute('stars')) || 300;
    this.render();
  }

  calculateTrajectory(rotationDegrees) {
    const ß = Math.abs(rotationDegrees);
    const ßRadians = this.MathUtils.toRadians(ß);

    const verticalDistance =
      Math.abs(Math.sin(ßRadians)) * this.CONFIG.METEOR_LENGTH * this.CONFIG.TRAJECTORY_MULTIPLIER;

    const horizontalDistance =
      Math.abs(Math.cos(ßRadians)) * this.CONFIG.METEOR_LENGTH * this.CONFIG.TRAJECTORY_MULTIPLIER;

    return {
      vertical: verticalDistance,
      horizontal: horizontalDistance,
      beta: ß,
    };
  }

  createMeteorStyle(rotation, scale, leftPercent, topPx) {
    const trajectory = this.calculateTrajectory(rotation);

    const isLeftward = trajectory.beta < 90;
    const horizontalSignInverse = isLeftward ? "" : "-";
    const initialMarginTop = `-${trajectory.vertical}px`;
    const initialMarginLeft = `${horizontalSignInverse}${trajectory.horizontal}px`;
    const initialTranslate = `${this.CONFIG.OFF_SET_X}px ${this.CONFIG.OFF_SET_Y}px`;

    return {
      left: `${leftPercent}%`,
      top: `${topPx}px`,
      width: `${this.CONFIG.METEOR_LENGTH}px`,
      transform: `rotate(${rotation}deg) scale(${scale})`,
      translate: initialTranslate,
      marginTop: initialMarginTop,
      marginLeft: initialMarginLeft,
    };
  }

  createStar() {
    const star = document.createElement("div");
    star.className = "star";

    const x = this.MathUtils.random(0, 100); // Percentage instead of fixed pixels
    const y = this.MathUtils.random(0, 100);
    const delay = this.MathUtils.random(0, this.CONFIG.MAX_TWINKLE_DELAY);

    Object.assign(star.style, {
      left: `${x}%`,
      top: `${y}%`,
      animationDelay: `${delay}s`,
    });

    return star;
  }

  createMeteor() {
    const meteor = document.createElement("div");
    meteor.className = "meteor";

    const rotation = -this.MathUtils.random(
      this.CONFIG.MIN_ROTATION,
      this.CONFIG.MAX_ROTATION
    );
    const scale = this.MathUtils.random(this.CONFIG.MIN_SCALE, this.CONFIG.MAX_SCALE);
    const leftPercent = this.MathUtils.random(
      this.CONFIG.MIN_LEFT_PERCENT,
      this.CONFIG.MAX_LEFT_PERCENT
    );
    const topPx = this.MathUtils.random(this.CONFIG.MIN_TOP, this.CONFIG.MAX_TOP);
    const duration = this.MathUtils.random(
      this.CONFIG.MIN_DURATION,
      this.CONFIG.MAX_DURATION
    );
    const delay = this.MathUtils.random(0, this.CONFIG.MAX_DELAY);

    const meteorStyle = this.createMeteorStyle(rotation, scale, leftPercent, topPx);
    Object.assign(meteor.style, meteorStyle);
    meteor.style.animation = `meteor ${duration}s linear ${delay}s infinite`;

    return meteor;
  }

  createStars() {
    const starsContainer = this.shadowRoot.querySelector(".stars");
    if (!starsContainer) return;

    // Clear existing stars
    starsContainer.innerHTML = '';

    const fragment = document.createDocumentFragment();
    for (let i = 0; i < this.stars; i++) {
      fragment.appendChild(this.createStar());
    }
    starsContainer.appendChild(fragment);
  }

  createMeteors() {
    const meteorsContainer = this.shadowRoot.querySelector(".meteors");
    if (!meteorsContainer) return;

    // Clear existing meteors
    meteorsContainer.innerHTML = '';

    const fragment = document.createDocumentFragment();
    for (let i = 0; i < this.meteors; i++) {
      fragment.appendChild(this.createMeteor());
    }
    meteorsContainer.appendChild(fragment);
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          height: 100%;
          position: relative;
        }
        
        .meteor-container {
          --primary: #2a0919;
          --secondary: #030d1b;
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background-image: radial-gradient(
            ellipse at top,
            var(--primary) 0%,
            var(--secondary) 95%
          );
        }

        .stars {
          position: absolute;
          width: 100%;
          height: 100%;
        }

        .meteors {
          position: absolute;
          width: 100%;
          height: 100%;
        }

        .star {
          --size-star: 1px;
          position: absolute;
          width: var(--size-star);
          height: var(--size-star);
          background: #fff;
          border-radius: 50%;
          animation: twinkle 2s infinite alternate;
          opacity: 0.3;
        }

        .meteor {
          position: absolute;
          height: 1px;
          background-image: linear-gradient(to right, #fff, rgba(255, 255, 255, 0));
          opacity: 0;
        }

        .meteor::before {
          --width: 5px;
          --height: 5px;
          content: "";
          position: absolute;
          width: var(--width);
          height: var(--height);
          border-radius: 50%;
          top: 50%;
          transform: translateY(-50%);
          left: calc(var(--width) * -1);
          background: #fff;
          box-shadow: 0 0 15px 3px #fff;
        }

        @keyframes twinkle {
          0% { opacity: 0.3; }
          100% { opacity: 0.6; }
        }

        @keyframes meteor {
          25% { opacity: 0.5; }
          75% { opacity: 0; }
          100% {
            margin-top: 0px;
            margin-left: 0px;
            opacity: 0;
          }
        }
      </style>
      
      <div class="meteor-container">
        <div class="stars"></div>
        <div class="meteors"></div>
      </div>
    `;

    this.createStars();
    this.createMeteors();
  }
}

// Register the custom element
customElements.define('meteor-shower', MeteorShower);

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MeteorShower;
}