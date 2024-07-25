# Legend of Zelda Triforce Web Component

A simple web component that uses 3D CSS Transforms to animate the triforce on to the screen.

[Demo](https://t0mgerman.github.io/LoZ-Triforce-WebComponent)

Although JS is used to describe the component and apply resize behaviours, the 3D and animation are implemented in CSS. A properly lit and textured version of this could easily be created using threejs or similar. 

The component is written to draw centrally on the page, but could be amended to animate to a particular origin. To use it, include `triforce.js` on the page (ideally with `defer`) and then use the `<animated-triforce />` node in your HTML.

You can apply attributes to the component:

|Attribute|Default|Description|
|---|---|---|
| color | <span style="white-space: nowrap"><img valign="middle" alt="color default" src="https://readme-swatches.vercel.app/ffca00?style=round" /> `#ffcca00`</span> | The primary color |
| shade | <span style="white-space: nowrap"><img valign="middle" alt="shade default" src="https://readme-swatches.vercel.app/8c6a00?style=round" /> `#8c6a00`</span> | A darker shade to give the illusion of 3D |
| accent | <span style="white-space: nowrap"><img valign="middle" alt="accent default" src="https://readme-swatches.vercel.app/b28600?style=round" /> `#b28600`</span> | Another shade for variety |
| style | `<not-set>` | Styles to be passed through to root element of the component |
| show-logo | `true` | Determines if the Zelda logo should appear at the end of the animation | 
| centered | `true` | Determines if the Triforce animates to the center of the page or not |
| enableRestart | `false` | When enabled allows a double-tap (on mobile) or double-click to restart the animation |
