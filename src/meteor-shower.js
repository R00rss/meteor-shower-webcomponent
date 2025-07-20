class MeteorShower extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this.DEFAULT_VALUES_ATTRIBUTES = {
      meteors: 30,
      stars: 300,
      show_black_hole: false,
      type_gradient: 'radial',
    };

    this.VALID_OPTIONS = {
      boolean: ['true', 'false'],
      type_gradient: ['radial', 'linear'],
    };

    // initialize attributes with default values
    this.meteors = this.DEFAULT_VALUES_ATTRIBUTES.meteors;
    this.stars = this.DEFAULT_VALUES_ATTRIBUTES.stars;
    this.show_black_hole = this.DEFAULT_VALUES_ATTRIBUTES.show_black_hole;
    this.type_gradient = this.DEFAULT_VALUES_ATTRIBUTES.type_gradient;

    this._initialized = false;

    // create config

    //TODO add this to attributes for full customization
    this.CONFIG = {
      METEOR_LENGTH: 200,
      TRAJECTORY_MULTIPLIER: 10,

      MIN_ROTATION_DEGREE: 45,
      MAX_ROTATION_DEGREE: 135,

      MIN_SCALE: 0.5,
      MAX_SCALE: 1.0,

      MIN_DURATION_SECONDS: 3,
      MAX_DURATION_SECONDS: 10,

      MAX_DELAY_SECONDS: 5,

      MIN_LEFT_PERCENT: -10,
      MAX_LEFT_PERCENT: 80,

      MIN_TOP_PERCENT: -50,
      MAX_TOP_PERCENT: 80,

      MAX_TWINKLE_DELAY_SECONDS: 2
    };



    this.MathUtils = {
      random: (min, max) => Math.random() * (max - min) + min,
      toRadians: (degrees) => degrees * (Math.PI / 180),
      randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
    };
  }

  /**
   * Validates and parses a boolean attribute value
   * @param {string} value - The attribute value to validate
   * @param {boolean} defaultValue - The default value to use if invalid
   * @param {string | undefined} attributeName - The name of the attribute (for warnings) 
   * @returns {boolean} The parsed boolean value
   */
  validateBooleanAttribute(value, defaultValue, attributeName) {
    if (this.VALID_OPTIONS.boolean.includes(value)) {
      return value === 'true';
    } else {
      attributeName && console.warn(`Invalid ${attributeName} value: ${value}. Defaulting to '${defaultValue}'.`);
      return defaultValue;
    }
  }

  static get observedAttributes() {
    return ['meteors', 'stars', 'show_black_hole', 'type_gradient'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    switch (name) {
      case 'type_gradient':
        if (this.VALID_OPTIONS.type_gradient.includes(newValue)) {
          this.type_gradient = newValue;
        } else {
          console.warn(`Invalid type_gradient value: ${newValue}. Defaulting to 'radial'.`);
          this.type_gradient = 'radial';
        }
        break;
      case 'show_black_hole':
        this.show_black_hole = this.validateBooleanAttribute(
          newValue,
          this.DEFAULT_VALUES_ATTRIBUTES.show_black_hole,
          'show_black_hole'
        );
        break;
      case 'meteors':
      case 'stars':
        const defaultValue = this.DEFAULT_VALUES_ATTRIBUTES[name];
        const parsedValue = parseInt(newValue);
        this[name] = Math.max(1, isNaN(parsedValue) ? defaultValue : parsedValue);
        break;
      default:
        console.warn(`Unknown attribute: ${name}. No action taken.`);
    }

    if (this._initialized) {
      this.updateContent();
    }
  }

  connectedCallback() {
    const attributes = MeteorShower.observedAttributes;
    attributes.forEach(attr => {
      const value = this.getAttribute(attr);
      if (value !== null) {
        this.attributeChangedCallback(attr, null, value);
      }
    });

    this.render();
  }

  disconnectedCallback() {
    // Cleanup animations for better performance
    if (this.shadowRoot) {
      const animatedElements = this.shadowRoot.querySelectorAll('.meteor, .star, .black-hole');
      animatedElements.forEach(element => {
        if (element.style) {
          element.style.animation = 'none';
        }
      });
    }
  }

  calculateTrajectory(rotationDegrees) {
    const ß = Math.abs(rotationDegrees);
    const ßRadians = this.MathUtils.toRadians(ß);

    const senß = Math.sin(ßRadians);
    const cosß = Math.cos(ßRadians);

    const { METEOR_LENGTH: radius, TRAJECTORY_MULTIPLIER: constant } = this.CONFIG;

    const y = Math.abs(senß) * radius;
    const x = Math.abs(cosß) * radius;

    return {
      vertical: y * constant,
      horizontal: x * constant,
      beta: ß,
    };
  }

  createMeteorStyle(rotation, scale, leftPercent, topPercent) {
    const trajectory = this.calculateTrajectory(rotation);

    const isLeftward = trajectory.beta < 90;
    const horizontalSignInverse = isLeftward ? "" : "-";
    const initialMarginTop = `-${trajectory.vertical}px`;
    const initialMarginLeft = `${horizontalSignInverse}${trajectory.horizontal}px`;
    const initialTranslate = `${trajectory.horizontal}px ${trajectory.vertical}px`;

    return {
      left: `${leftPercent}%`,
      top: `${topPercent}%`,
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

    const x = this.MathUtils.random(0, 100);
    const y = this.MathUtils.random(0, 100);
    const delay = this.MathUtils.random(0, this.CONFIG.MAX_TWINKLE_DELAY_SECONDS);

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
      this.CONFIG.MIN_ROTATION_DEGREE,
      this.CONFIG.MAX_ROTATION_DEGREE
    );

    const scale = this.MathUtils.random(
      this.CONFIG.MIN_SCALE,
      this.CONFIG.MAX_SCALE
    );

    const leftPercent = this.MathUtils.random(
      this.CONFIG.MIN_LEFT_PERCENT,
      this.CONFIG.MAX_LEFT_PERCENT
    );

    const topPercent = this.MathUtils.random(
      this.CONFIG.MIN_TOP_PERCENT,
      this.CONFIG.MAX_TOP_PERCENT
    );

    const duration = this.MathUtils.random(
      this.CONFIG.MIN_DURATION_SECONDS,
      this.CONFIG.MAX_DURATION_SECONDS
    );

    const delay = this.MathUtils.random(
      0,
      this.CONFIG.MAX_DELAY_SECONDS
    );

    const meteorStyle = this.createMeteorStyle(rotation, scale, leftPercent, topPercent);
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

  createBlackHole() {
    if (!this.show_black_hole) return;

    const container = this.shadowRoot.querySelector('.meteor-container');
    if (!container) return;

    const blackHole = document.createElement('div');
    blackHole.className = 'black-hole';
    blackHole.innerHTML = `
      <div class="black-hole-detail-center"></div>
      <div class="black-hole-detail-top-left"></div>
      <div class="black-hole-detail-top-right"></div>
    `;
    container.appendChild(blackHole);
  }

  updateBlackHole() {
    const existing = this.shadowRoot.querySelector('.black-hole');
    if (existing) {
      existing.remove();
    }

    this.createBlackHole();
  }

  updateContent() {
    this.createStars();
    this.createMeteors();
    this.updateBlackHole();
  }

  getStyles() {
    return `
      :host {
        display: block;
        width: 100%;
        height: 100%;
        position: relative;
        --primary: #2a0919;
        --secondary: #030d1b;
        --size-star: 1px;
        --size-meteor: 5px;
        --tail-meteor-relation: 200;
        --size-tail-meteor: 200px;
      }
      
      .meteor-container {
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
        position: absolute;
        width: var(--size-star);
        height: var(--size-star);
        background: #fff;
        border-radius: 50%;
        animation: twinkle 2s infinite alternate, move-stars 2s ease-in-out infinite alternate;
        opacity: 0.3;
      }

      .meteor {
        position: absolute;
        height: calc(var(--size-tail-meteor) / var(--tail-meteor-relation));
        width: var(--size-tail-meteor);
        background-image: linear-gradient(to right, #fff, rgba(255, 255, 255, 0));
        opacity: 0;
      }

      .meteor::before {
        content: "";
        position: absolute;
        width: var(--size-meteor);
        height: var(--size-meteor);
        border-radius: 50%;
        top: 50%;
        transform: translateY(-50%);
        left: calc(var(--size-meteor) * -1);
        background: #fff;
        box-shadow: 0 0 15px 3px #fff;
      }

      @keyframes twinkle {
        0% { opacity: 0.3; }
        100% { opacity: 0.6; }
      }

      @keyframes move-stars {
        0% { transform: translate(0, 0); }
        100% { transform: translate(-5px, 5px); }
      }

      @keyframes meteor {
        25% { opacity: 0.5; }
        100% {
          margin-top: 0px;
          margin-left: 0px;
          opacity: 0;
        }
      }

      .black-hole {
        z-index: 0;
        position: absolute;
        width: 200px;
        height: 200px;
        top: 10%;
        right: 10%;
        animation: move-black-hole 100s linear infinite alternate;
      }

      @keyframes move-black-hole {
        0% { transform: translate(0, 0); }
        100% { transform: translate(-500px,500px); }
      }

      .black-hole::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 100px;
        height: 100px;
        border-radius: 50%;
        box-shadow: 
          0 0 1px 5px #ffffffff, 
          0 0 10px 10px #c6987efb, 
          0 0 10px 15px #b05c32ff, 
          0 0 10px 16px #ff6600ff, 
          inset 0 0 8px 5px #fbfbfafb,
          inset 0 0 5px 10px #ce6835ff,
          inset 0 0 1px 30px white;
        transform: rotateX(80deg) rotateY(-10deg) translate(-50%, -50%);
        transform-origin: center;
      }
        
      .black-hole::after {
        z-index: 1;
        content: '';
        position: absolute;
        top: 60%;
        left: 42%;
        width:40px;
        height: 40px;
        border-radius: 50%;
        transform:rotate(250deg);
        background:black;
        box-shadow: 
          -1px -1px 1px 1px #dc6124ff,
          4px -3px 1px 4px black,
          -3px -5px 1px 4px #fbcdb6ff,
          0 0px 3px 5px #dc6124ff,
          0 0px 3px 6px #efe4e4ff,
          0 1px 3px 8px #ff8c00ff,
          3px -4px 10px 10px #dc6124ff,
          3px -4px 8px 13px #f5f1efff,
          5px -2px 3px 14px #ffffff;
        transform-origin: center;
      }

      .black-hole-detail-center {
        z-index: 2;
        position: absolute;
        top: 74%;
        left: 50%;
        transform: rotate(-10deg) translate(-50%, -50%);
        width: 80px;
        height: 4px;
        border-radius: 50%;
        background: white;
        box-shadow: 
          0 0 5px 2px #ffffff,
          0 0 10px 5px #ffffff,
          inset 0 0 5px 3px #ffffff;
      }

      .black-hole-detail-top-left {
        z-index: 3;
        position: absolute;
        top: 75%;
        left: 27%;
        transform: rotate(110deg) translate(-50%, -50%);
        width: 16px;
        height: 1px;
        border-radius: 50%;
        background: white;
        box-shadow: 
          0 0 2px 1px #ffffff,
          0 0 5px 3px #ffffff;
      }

      .black-hole-detail-top-right {
        z-index: 3;
        position: absolute;
        top: 70%;
        right: 25%;
        transform: rotate(50deg) translate(-50%, -50%);
        width: 16px;
        height: 1px;
        border-radius: 50%;
        background: white;
        box-shadow: 
          0 0 2px 1px #ffffff,
          0 0 5px 3px #ffffff;
      }

      @keyframes spin {
        0% { transform: translate(-50%, -50%) rotate(0deg); }
        100% { transform: translate(-50%, -50%) rotate(360deg); }
      }
    `;
  }

  getTemplate() {
    return `
      <style>${this.getStyles()}</style>
      <div class="meteor-container">
        <div class="stars"></div>
        <div class="meteors"></div>
      </div>
    `;
  }

  render() {
    if (!this._initialized) {
      this.shadowRoot.innerHTML = this.getTemplate();
      this._initialized = true;
    }

    this.updateContent();
  }

  // Public API methods
  updateMeteors(count) {
    this.meteors = Math.max(1, count);
    this.setAttribute('meteors', this.meteors);
  }

  updateStars(count) {
    this.stars = Math.max(1, count);
    this.setAttribute('stars', this.stars);
  }

  toggleBlackHole(show = !this.show_black_hole) {
    this.show_black_hole = show;
    this.setAttribute('show_black_hole', show);
  }

  // Getters for current state
  get meteorCount() {
    return this.meteors;
  }

  get starCount() {
    return this.stars;
  }

  get hasBlackHole() {
    return this.show_black_hole;
  }
}

// Register the custom element
customElements.define('meteor-shower', MeteorShower);

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MeteorShower;
}