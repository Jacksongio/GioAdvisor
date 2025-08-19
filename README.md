# GioAdvisor - Military Conflict Simulation Platform

A sophisticated web application for simulating military conflict scenarios and analyzing international warfare with advanced AI-powered strategic insights.

![GioAdvisor Screenshot](https://via.placeholder.com/800x400/cf5c36/ffffff?text=GioAdvisor+Military+Dashboard)

## 🌟 Features

- **Military Force Simulation**: Choose from 15+ major world powers with detailed military capabilities
- **Military Conflict Analysis**: Simulate various military conflict types including territorial conflicts, nuclear threats, proxy wars, conventional warfare, naval conflicts, and air campaigns
- **Strategic Parameters**: Configure economic, military readiness, and diplomatic factors for comprehensive war simulation
- **Military Strategic Recommendations**: Get AI-powered military insights and strategic warfare advice
- **Dark Theme Interface**: Professional dark UI with orange flame accents for tactical operations
- **Responsive Design**: Works seamlessly on desktop and mobile devices for field operations

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed on your machine:

- **Node.js** (version 18.0 or higher)
- **npm** or **yarn** package manager
- **Git** for version control

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/yourusername/political-advisor.git
   cd political-advisor
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   Edit `.env.local` with your specific configuration values.

4. **Run the development server**
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   \`\`\`

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

\`\`\`
political-advisor/
├── app/                    # Next.js 13+ App Router
│   ├── globals.css        # Global styles and Tailwind CSS
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Main application page
├── components/            # Reusable UI components
│   └── ui/               # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── select.tsx
│       └── ...
├── lib/                  # Utility functions
│   └── utils.ts          # Common utilities
├── public/               # Static assets
├── .env.example          # Environment variables template
├── next.config.js        # Next.js configuration
├── tailwind.config.ts    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Project dependencies
\`\`\`

## 🛠️ Built With

- **[Next.js 14](https://nextjs.org/)** - React framework with App Router
- **[React 18](https://reactjs.org/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Radix UI](https://www.radix-ui.com/)** - Headless UI components
- **[Lucide React](https://lucide.dev/)** - Beautiful icons
- **[shadcn/ui](https://ui.shadcn.com/)** - Re-usable components

## 🎨 Design System

### Color Palette
- **Primary Orange**: `#cf5c36` (Flame)
- **Dark Background**: `#0a0a0a`
- **Card Background**: `#1a1a1a`
- **Border Color**: `#2a2a2a`
- **Text Color**: `#e5e5e5`
- **Muted Text**: `#6b7280`

### Typography
- **Font Family**: Inter (Google Fonts)
- **Headings**: Semibold weights
- **Body Text**: Regular weight
- **UI Elements**: Medium weight

## 📱 Usage

### Setting Up a Military Simulation

1. **Select Your Military Force**: Choose which nation's military you want to command
2. **Define Military Conflict**: Select military conflict type and specify attacking/defending forces
3. **Configure Military Parameters**: Adjust economic, military readiness, and diplomatic factors for warfare analysis
4. **Execute Military Analysis**: Run the simulation to get strategic military insights

### Understanding Military Results

- **Diplomatic Response**: Effectiveness of diplomatic approaches during military conflict
- **Military Readiness**: Defense capabilities, alliance support, and strategic resources
- **Economic Impact**: Financial consequences of military engagement
- **Public Support**: Domestic approval for military action
- **Military Strategic Recommendations**: AI-generated tactical and strategic action items

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler

### Adding New Features

1. Create new components in `components/ui/`
2. Add utility functions to `lib/utils.ts`
3. Update types in TypeScript files
4. Test thoroughly before committing

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Configure environment variables
4. Deploy automatically on every push

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- **Netlify**
- **AWS Amplify**
- **Railway**
- **DigitalOcean App Platform**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **shadcn/ui** for the beautiful component library
- **Radix UI** for accessible headless components
- **Vercel** for the amazing deployment platform
- **Tailwind CSS** for the utility-first CSS framework

## 📞 Support

If you have any questions or need help, please:

1. Check the [Issues](https://github.com/yourusername/political-advisor/issues) page
2. Create a new issue if your problem isn't already reported
3. Contact the maintainers

---

**Made with ❤️ for political simulation and analysis**
