# GioAdvisor - AI-Powered Geopolitical Analysis & Military Conflict Simulation Platform

![GioAdvisor Screenshot](public/fogreport.png)

A sophisticated web application for simulating military conflict scenarios, analyzing international warfare, and generating AI-powered strategic intelligence briefings with advanced RAG (Retrieval-Augmented Generation) capabilities.


## 🌟 Features

- **Military Force Simulation**: Choose from 150+ world powers with detailed military capabilities
- **Military Conflict Analysis**: Simulate various military conflict types including territorial conflicts, nuclear threats, proxy wars, conventional warfare, naval conflicts, and air campaigns
- **Strategic Parameters**: Configure economic, military readiness, and diplomatic factors for comprehensive war simulation
- **AI-Powered Strategic Intelligence**: Generate comprehensive intelligence briefings using advanced RAG systems
- **Treaty Analysis**: Leverage real international treaties and legal frameworks for strategic recommendations
- **RAGAS Evaluation**: Built-in quality assessment using RAGAS metrics for briefing accuracy and relevance
- **Dark Theme Interface**: Professional dark UI with orange flame accents for tactical operations
- **Responsive Design**: Works seamlessly on desktop and mobile devices for field operations

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed on your machine:

- **Node.js** (version 18.0 or higher)
- **npm** or **pnpm** package manager
- **Git** for version control
- **OpenAI API Key** for AI-powered analysis

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/gioadvisor.git
   cd gioadvisor
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your specific configuration values:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
gioadvisor/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes
│   │   ├── ai/            # AI analysis endpoints
│   │   ├── analysis/      # Conflict analysis endpoints
│   │   ├── briefing/      # Intelligence briefing generation
│   │   ├── countries/     # Country data endpoints
│   │   ├── simulations/   # Simulation management
│   │   └── treaties/      # Treaty evaluation and query
│   ├── globals.css        # Global styles and Tailwind CSS
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Main application page
├── components/            # Reusable UI components
│   ├── LandingPage.tsx   # Landing page component
│   ├── StarryBackground.tsx # Animated background
│   └── ui/               # shadcn/ui components
├── lib/                  # Core libraries and utilities
│   ├── openai.ts         # OpenAI client configuration
│   ├── rag-briefing-agent.ts # RAG-based briefing generation
│   ├── rag-retrieval-system.ts # Treaty retrieval system
│   ├── rag-treaty-processor.ts # Treaty processing utilities
│   ├── ragas-evaluation.ts # RAGAS quality assessment
│   ├── treaty-rag.ts     # Treaty RAG implementation
│   └── utils.ts          # Common utilities
├── data/                 # Data files
│   ├── analysis.json     # Analysis data
│   ├── simulations.json  # Simulation data
│   └── treaties.txt      # Treaty database
├── public/               # Static assets
├── next.config.js        # Next.js configuration
├── tailwind.config.ts    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Project dependencies
```

## 🛠️ Built With

- **[Next.js 14](https://nextjs.org/)** - React framework with App Router
- **[React 18](https://reactjs.org/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Radix UI](https://www.radix-ui.com/)** - Headless UI components
- **[Lucide React](https://lucide.dev/)** - Beautiful icons
- **[shadcn/ui](https://ui.shadcn.com/)** - Re-usable components
- **[OpenAI GPT-4](https://openai.com/)** - Advanced AI analysis
- **[RAG Systems](https://arxiv.org/abs/2005.11401)** - Retrieval-Augmented Generation
- **[RAGAS](https://github.com/explodinggradients/ragas)** - Quality evaluation metrics

## 🧠 AI & RAG Capabilities

### Intelligent Analysis
- **Conflict Simulation**: AI-powered analysis of military scenarios with realistic outcomes
- **Strategic Recommendations**: Context-aware military and diplomatic advice
- **Risk Assessment**: Comprehensive evaluation of conflict escalation and de-escalation

### RAG-Powered Intelligence
- **Treaty Retrieval**: Advanced search through international legal frameworks
- **Contextual Analysis**: AI reasoning based on relevant treaties and legal precedents
- **Quality Assurance**: RAGAS metrics for faithfulness and answer relevancy
- **Hybrid Search**: Combines semantic and keyword-based retrieval for optimal results

### Briefing Generation
- **Intelligence Reports**: Professional-grade strategic briefings
- **Legal Implications**: Analysis of international law and treaty obligations
- **Strategic Options**: Multiple pathways for conflict resolution and management

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
3. **Generate Intelligence Briefing**: Create comprehensive RAG-powered intelligence reports.

### Understanding Military Results

- **Diplomatic Response**: Effectiveness of diplomatic approaches during military conflict
- **Military Readiness**: Defense capabilities, alliance support, and strategic resources
- **Economic Impact**: Financial consequences of military engagement
- **Public Support**: Domestic approval for military action
- **AI Strategic Recommendations**: AI-generated tactical and strategic action items
- **Legal Framework Analysis**: Treaty-based legal implications and obligations

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Features

1. Create new components in `components/ui/`
2. Add utility functions to `lib/utils.ts`
3. Update types in TypeScript files
4. Test thoroughly before committing

### RAG System Development

The platform includes a sophisticated RAG system for treaty analysis:
- **Treaty Retrieval**: Semantic search through international legal documents
- **Context Processing**: AI-powered analysis of legal implications
- **Quality Metrics**: RAGAS evaluation for briefing quality assurance

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
- **OpenAI** for advanced AI capabilities
- **RAGAS** for quality evaluation metrics
- **Vercel** for the amazing deployment platform
- **Tailwind CSS** for the utility-first CSS framework

## 📞 Support

If you have any questions or need help, please:

1. Check the [Issues](https://github.com/yourusername/gioadvisor/issues) page
2. Create a new issue if your problem isn't already reported
3. Contact the maintainers

---


## ⚠️ Important Disclaimer

**DISCLAIMER:** This application generates AI-generated content created for educational and simulation purposes only. This analysis should NOT be used as the basis for any real-world military, diplomatic, or policy decisions. Any actual strategic planning or crisis response should involve consultation with qualified professionals, subject matter experts, and appropriate government authorities. The scenarios, recommendations, and assessments presented herein are hypothetical and do not reflect official government positions or classified intelligence.

*FogReport - Bringing clarity through the fog of war with AI-powered intelligence.*
