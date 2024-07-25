class Triforce extends HTMLElement {
    // The component updates when these attributes are changed
    static observedAttributes = ["style", "color", "shade", "accent", "show-logo", "centered", "enableRestart"];

    // Default values for the component
    triangleColor = '#ffca00';
    triangleShade = '#8c6a00';
    triangleAccent = '#b28600';
    showLogo = true;
    centered = true;
    enableRestart = false;

    // If the user specifies a scale in the style attribute, 
    // this will be used as the base scale and zoom will be applied
    // to the base scale
    baseScale = 1;

    // Zoom detection ratio
    px_ratio = window.devicePixelRatio || window.screen.availWidth / document.documentElement.clientWidth;
    
    // Internal variables
    shadowDom = null;
    dynamicStyles = null;
    lastTouch = 0;

    constructor() {
        self = super();
        if (this.hasAttribute('color')) {
            this.triangleColor = this.getAttribute('color');
        }
        if (this.hasAttribute('shade')) {
            this.triangleShade = this.getAttribute('shade');
        }
        if (this.hasAttribute('accent')) {
            this.triangleAccent = this.getAttribute('accent');
        }
        if (this.hasAttribute('show-logo')) {
            this.showLogo = this.getAttribute('show-logo') === 'true';
        }
        if (this.hasAttribute('centered')) {
            this.centered = this.getAttribute('centered') === 'true';
        }
        if (this.hasAttribute('enableRestart')) {
            this.enableRestart = this.getAttribute('enableRestart') === 'true';
        }
        if (this.hasAttribute('style')) {
            const scale = /scale:\s+([0-9.]+)/.exec(this.getAttribute('style'));
            if (scale) {
                this.baseScale = parseFloat(scale[1]);
            }
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        const triforceEl = this.shadowDom?.getElementById('triforce');
        if (name === 'color') {
            this.triangleColor = newValue;
        }
        if (name === 'shade') {
            this.triangleShade = newValue;
        }
        if (name === 'accent') {
            this.triangleAccent = newValue;
        }
        if ([ 'color', 'shade', 'accent' ].indexOf(name) >= 0) {
            // Update the dynamic styles
            if (this.shadowDom && this.dynamicStyles) {
                this.dynamicStyles.replaceSync([
                    `#triforce {
                        --triangleColor: ${this.triangleColor};
                        --triangleShade: ${this.triangleShade};
                        --triangleAccent: ${this.triangleAccent};
                    }`,
                    ...this.getColorAnimationKeyframes()
                ].join(''));
            }
        }
        if (triforceEl && name === 'style') {
            triforceEl.setAttribute("style", newValue);
            const scale = /scale:\s+([0-9.]+)/.exec(newValue);
            if (scale) {
                this.baseScale = parseFloat(scale[1]);
            }
        }
        if (triforceEl && name === 'centered') {
            this.centered = newValue === 'true';
            if (newValue === 'true') {
                triforceEl.classList.add('centered');
            } else {
                triforceEl.classList.remove('centered');
            }
        }
        if (triforceEl && name === 'show-logo') {
            this.showLogo = newValue === 'true'; 
            if (newValue === 'true') {
                triforceEl.classList.add('show-logo');
            } else {
                triforceEl.classList.remove('show-logo');
            }
        }
    }

    connectedCallback() {
        // Create shadow DOM
        this.shadowDom = this.attachShadow({ mode: 'open' });

        // Add base styles
        const styleTag = document.createElement('link');
        styleTag.setAttribute('rel', 'stylesheet');
        styleTag.setAttribute('href', 'triforce.css');

        // Add dynamic styles based on default colours
        // or those set in component attributes
        this.dynamicStyles = new CSSStyleSheet();
        this.dynamicStyles.insertRule(
            `#triforce {
                --triangleColor: ${this.triangleColor};
                --triangleShade: ${this.triangleShade};
                --triangleAccent: ${this.triangleAccent};
            }`
        );
        this.getColorAnimationKeyframes().forEach((keyframeRule) => {
            this.dynamicStyles.insertRule(keyframeRule);
        });
        this.shadowDom.adoptedStyleSheets = [this.dynamicStyles];

        // Add HTML
        const rootEl = document.createElement('div');
        rootEl.id = 'triforce';
        rootEl.className = 'animating' + 
            (this.showLogo ? ' show-logo' : '') +
            (this.centered ? ' centered' : '');
        rootEl.innerHTML = `
            <div class="container">
                <div class="triforce-of-power">
                    <div class="center-empty">
                        <div class="front"></div>
                        <div class="back"></div>
                        <div class="left"></div>
                        <div class="right"></div>
                        <div class="bottom"></div>
                    </div>
                </div>
                <div class="triforce-of-wisdom">
                    <div class="center-empty">
                        <div class="front"></div>
                        <div class="back"></div>
                        <div class="left"></div>
                        <div class="right"></div>
                        <div class="bottom"></div>
                    </div>
                </div>
                <div class="triforce-of-courage">
                    <div class="center-empty">
                        <div class="front"></div>
                        <div class="back"></div>
                        <div class="left"></div>
                        <div class="right"></div>
                        <div class="bottom"></div>
                    </div>
                </div>
                <div class="zelda-logo">
                </div>
            </div>
        `;

        // If the user clicks on the triforce, skip the animation
        rootEl.onclick = this.skipAnimOnClick.bind(this);
        if (this.enableRestart) {
            rootEl.ondblclick = this.restartAnimation.bind(this);
            rootEl.addEventListener('touchend', this.detectDoubleTap.bind(this));
        }

        // Output to sDOM
        rootEl.setAttribute("style", this.getAttribute("style"));
        rootEl.appendChild(styleTag);
        this.shadowDom.appendChild(rootEl);

        // Add resize handler, apply initial scale
        this.resizeHandler(true);
        window.addEventListener('resize', this.resizeHandler.bind(this));
    }

    disconnectedCallback() {
        window.removeEventListener('resize', this.resizeHandler);
        if (this.enableRestart) {
            this.shadowDom?.getElementById('triforce')?.removeEventListener('touchend', this.detectDoubleTap);
        }
    }

    resizeHandler(force = false) {
        const ratio = window.devicePixelRatio || window.screen.availWidth / document.documentElement.clientWidth;
        if (force || this.px_ratio !== ratio) {
            this.px_ratio = ratio;
            const zoom = Math.round((window.outerWidth - 10) / window.innerWidth);
            if (this.shadowDom) {
                this.shadowDom.getElementById('triforce').style.scale = `${(zoom * this.baseScale)}`;
            }
        }
    }

    skipAnimOnClick() {
        this.shadowDom.getElementById('triforce').classList.remove('animating');
    }

    detectDoubleTap(event) {
        const now = new Date().getTime();
        const timeDiff = now - this.lastTouch;
        if (timeDiff < 600 && timeDiff > 0) {
            this.restartAnimation();
            event.preventDefault();
        }
        this.lastTouch = now;
    }

    restartAnimation() {
        this.shadowDom.getElementById('triforce').classList.remove('animating');
        this.shadowDom.getElementById('triforce').classList.add('animating');
    }

    getColorAnimationKeyframes() {
        return [
            `@keyframes frontSpinColor {
                0% {
                    border-bottom:80px solid ${this.triangleColor};
                }
                16.66% {
                    border-bottom:80px solid ${this.triangleShade};
                }
                33.32% {
                    border-bottom:80px solid ${this.triangleColor};
                }
                49.98% {
                    border-bottom:80px solid ${this.triangleShade};
                }
                66.64% {
                    border-bottom:80px solid ${this.triangleColor};
                }
                83.3% {
                    border-bottom:80px solid ${this.triangleShade};
                }
                100% {
                    border-bottom:80px solid ${this.triangleColor};
                }
            }`,
            `@keyframes backSpinColor {
                0% {
                    border-bottom:80px solid ${this.triangleShade};
                }
                16.66% {
                    border-bottom:80px solid ${this.triangleColor};
                }
                33.32% {
                    border-bottom:80px solid ${this.triangleShade};
                }
                49.98% {
                    border-bottom:80px solid ${this.triangleColor};
                }
                66.64% {
                    border-bottom:80px solid ${this.triangleShade};
                }
                83.3% {
                    border-bottom:80px solid ${this.triangleColor};
                }
                100% {
                    border-bottom:80px solid ${this.triangleShade};
                }
            }`,
            `@keyframes leftSpinColor {
                0% {
                    background-color: ${this.triangleAccent};
                }
                16.66% {
                    background-color: ${this.triangleColor};
                }
                33.32% {
                    background-color: ${this.triangleAccent};
                }
                49.98% {
                    background-color: ${this.triangleColor};
                }
                66.64% {
                    background-color: ${this.triangleAccent};
                }
                83.3% {
                    background-color: ${this.triangleColor};
                }
                100% {
                    background-color: ${this.triangleAccent};
                }
            }`,
            `@keyframes rightSpinColor {
                0% {
                    background-color: ${this.triangleColor};
                }
                16.66% {
                    background-color: ${this.triangleAccent};
                }
                33.32% {
                    background-color: ${this.triangleColor};
                }
                49.98% {
                    background-color: ${this.triangleAccent};
                }
                66.64% {
                    background-color: ${this.triangleColor};
                }
                83.3% {
                    background-color: ${this.triangleAccent};
                }
                100% {
                    background-color: ${this.triangleColor};
                }
            }`
        ];
    }
}

customElements.define('animated-triforce', Triforce);