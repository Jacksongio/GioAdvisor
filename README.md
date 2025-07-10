# Political Advisor - Global Conflict Simulation Platform

A sophisticated web application for simulating political scenarios and analyzing international conflicts with advanced AI-powered insights.

![Political Advisor Screenshot](https://via.placeholder.com/800x400/cf5c36/ffffff?text=Political+Advisor+Dashboard)

## 🌟 Features

- **Country Simulation**: Choose from 15+ major world powers with detailed power ratings
- **Conflict Analysis**: Simulate various conflict types including territorial disputes, trade wars, cyber attacks, and more
- **Advanced Parameters**: Configure economic, military, and diplomatic factors
- **Strategic Recommendations**: Get AI-powered insights and strategic advice
- **Dark Theme Interface**: Professional dark UI with orange flame accents
- **Responsive Design**: Works seamlessly on desktop and mobile devices

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

### Setting Up a Simulation

1. **Select Your Country**: Choose which nation you want to simulate as
2. **Define Conflict**: Select conflict type and specify offensive/defensive countries
3. **Configure Parameters**: Adjust economic, military, and diplomatic factors
4. **Run Analysis**: Execute the simulation to get strategic insights

### Understanding Results

- **Diplomatic Success**: Effectiveness of diplomatic approaches
- **Military Readiness**: Defense capabilities and preparedness
- **Economic Impact**: Financial consequences of the conflict
- **Public Support**: Domestic approval ratings
- **Strategic Recommendations**: AI-generated action items

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
