# 🌟 Meteor Shower Web Component

A beautiful, lightweight meteor shower animation as a Web Component. Perfect for creating stunning backgrounds in landing pages, portfolios, and interactive websites.

## ✨ Features

- 🚀 **Zero dependencies** - Pure vanilla JavaScript
- 📦 **Lightweight** - Less than 5KB minified
- 🎨 **Customizable** - Control meteors and stars count
- 🔧 **Easy to use** - Just one HTML tag
- 📱 **Responsive** - Adapts to any container size
- 🌐 **Universal** - Works in all modern browsers
- 🎭 **Isolated** - Uses Shadow DOM, no style conflicts

## 🚀 Installation

### Via NPM
```bash
npm install meteor-shower-webcomponent
```

### Via CDN
```html
<script src="https://unpkg.com/meteor-shower-webcomponent@latest/dist/meteor-shower.min.js"></script>
```

## 📖 Usage

### Basic Usage
```html
<meteor-shower></meteor-shower>
```

### With Custom Settings
```html
<meteor-shower meteors="20" stars="500"></meteor-shower>
```

### With Custom Styling
```html
<meteor-shower 
  meteors="15" 
  stars="300"
  style="height: 60vh; border-radius: 15px;">
</meteor-shower>
```

### Using as Background
```html
<div style="position: relative; height: 100vh;">
  <meteor-shower style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></meteor-shower>
  <div style="position: relative; z-index: 1;">
    <h1>Your content here</h1>
  </div>
</div>
```

## ⚙️ Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `meteors` | Number | `10` | Number of meteors to display |
| `stars` | Number | `300` | Number of background stars |

## 🎨 Customization

The component uses CSS custom properties that you can override:

```css
meteor-shower {
  --primary: #2a0919;    /* Primary gradient color */
  --secondary: #030d1b;   /* Secondary gradient color */
}
```

## 🌐 Browser Support

- Chrome 54+
- Firefox 63+
- Safari 10.1+
- Edge 79+

## 📝 Examples

### Landing Page Background
```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://unpkg.com/meteor-shower-webcomponent@latest/dist/meteor-shower.min.js"></script>
  <style>
    body { margin: 0; font-family: Arial, sans-serif; }
    .hero { position: relative; height: 100vh; display: flex; align-items: center; justify-content: center; }
    .content { position: relative; z-index: 1; text-align: center; color: white; }
  </style>
</head>
<body>
  <div class="hero">
    <meteor-shower meteors="15" stars="400"></meteor-shower>
    <div class="content">
      <h1>Welcome to the Future</h1>
      <p>Experience the magic of meteor showers</p>
    </div>
  </div>
</body>
</html>
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this in your projects!

## 🐛 Issues

Found a bug? Please [open an issue](https://github.com/R00rss/meteor-shower-webcomponent/issues) on GitHub.

## 🌟 Show Your Support

If you like this project, please give it a ⭐ on GitHub!

---

Made with ❤️ by [Ronny García](https://github.com/R00rss)