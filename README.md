# Bleak 🌳

**The Chatbot API that returns UI components, not plain text.**

Bleak revolutionizes AI-powered applications by delivering ready-to-use React components instead of plain text responses. Skip the conversion step and plug AI responses directly into your frontend apps.

![Bleak Landing Page](./docs/screenshot.png)

## ✨ Features

- **🎯 UI Components as Responses**: Get interactive React components, not text
- **⚡ Instant Integration**: Copy, paste, and ship—no conversion needed
- **🧠 Context-Aware**: AI understands your app structure and returns appropriate components
- **👥 Developer First**: Simple API, great docs, and active community
- **🎨 Modern Design**: Built with Vite, React, TypeScript, and Tailwind CSS

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/bleak.git
cd bleak

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Build Tool**: Vite
- **Icons**: Lucide React
- **State Management**: React Query
- **Email Service**: SMTP2Go (configurable)

## 📁 Project Structure

```
bleak/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── Landing.tsx     # Main landing page
│   │   └── ...
│   ├── api/                # API services
│   │   ├── emailService.ts # Email subscription handling
│   │   └── interactiveApi.ts # Bleak API integration
│   ├── styles/             # CSS and animations
│   └── lib/                # Utility functions
├── public/                 # Static assets
└── docs/                   # Documentation
```

## 🎨 Design Philosophy

The landing page is inspired by modern developer tools like Cursor.com, featuring:

- **Dark Theme**: Easy on the eyes for developers
- **Minimalist Design**: Focus on content, not distractions
- **Smooth Animations**: Engaging without being overwhelming
- **Clear Typography**: Excellent readability with Orbitron font
- **Developer-Focused Copy**: Speaks directly to the target audience

## 📧 Email Integration

The landing page includes email capture functionality. Currently configured for local storage in development:

### Setting up SMTP2Go

1. Sign up for [SMTP2Go](https://www.smtp2go.com/)
2. Get your API credentials
3. Update `src/api/emailService.ts`:

```typescript
export async function subscribeToNewsletter(email: string): Promise<boolean> {
  const response = await fetch("https://api.smtp2go.com/v3/email/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Smtp2go-Api-Key": "your-api-key-here"
    },
    body: JSON.stringify({
      // Your SMTP2Go configuration
    })
  });

  return response.ok;
}
```

## 🎯 Landing Page Sections

### Hero Section

- Animated logo with dramatic letter drop effect
- Compelling tagline: "The Chatbot API Built for Developers"
- Clear value proposition
- Email capture form
- Primary and secondary CTAs

### Features Section

- **Instant Integration**: UI components vs plain text
- **Smart Responses**: Context-aware AI
- **Developer First**: Built for developers

### Demo Section

- Code example showing the difference
- Visual representation of component output

### Social Proof

- Trusted company logos
- Developer testimonials (ready for real testimonials)

### Footer

- Navigation links
- Social media links
- Copyright information

## 🔧 Customization

### Colors

The design uses a carefully crafted color palette:

- Primary: Blue (`#3B82F6`)
- Secondary: Purple (`#8B5CF6`)
- Accent: Green (`#10B981`)
- Background: Black (`#000000`)
- Text: White with opacity variations

### Typography

- Headers: Orbitron (futuristic, tech-focused)
- Body: Inter (readable, modern)

### Animations

All animations are CSS-based for performance:

- Letter drop animation for logo
- Gradient text effects
- Hover transitions
- Smooth reveal animations

## 📊 Performance

- **Lighthouse Score**: 95+ (target)
- **Bundle Size**: < 500KB gzipped
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s

## 🚀 Deployment

### Vercel (Recommended)

```bash
npm run build
npx vercel deploy
```

### Netlify

```bash
npm run build
npx netlify deploy --prod --dir=dist
```

### Traditional Hosting

```bash
npm run build
# Upload dist/ folder to your web server
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📈 Analytics & Tracking

Consider adding:

- Google Analytics for traffic insights
- Hotjar for user behavior analysis
- PostHog for product analytics
- Email service analytics for conversion tracking

## 🔮 Roadmap

- [ ] **Demo Integration**: Connect live Bleak API demo
- [ ] **Video Content**: Add product demo video
- [ ] **Blog Section**: Developer-focused content
- [ ] **Documentation**: Comprehensive API docs
- [ ] **Community**: Discord server integration
- [ ] **Testimonials**: Real developer testimonials
- [ ] **Pricing Page**: Pricing tiers and plans
- [ ] **Dashboard**: User portal for API management

## 📞 Support

- **GitHub Issues**: Bug reports and feature requests
- **Email**: hello@bleak.dev (update with real email)
- **Discord**: Join our community (coming soon)
- **Twitter**: [@BleakAPI](https://twitter.com/bleakapi) (update with real handle)

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

---

**Built with ❤️ for developers who want to ship faster.**

[Get Early Access](https://bleak.dev) • [GitHub](https://github.com/your-repo/bleak) • [Discord](https://discord.gg/bleak)
