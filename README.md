# Script Library

A beautiful dashboard for managing and viewing your GitHub scripts collection. Built with Next.js, Tailwind CSS, and shadcn/ui.

## Live Demo

Visit the live demo at [scripts.ztmoon.com](https://scripts.ztmoon.com)

## Features

- 🚀 Beautiful, modern UI with glass morphism effects
- 📱 Fully responsive design
- 🔍 Real-time script search
- 📖 README viewer with Markdown support
- 🔒 GitHub token authentication for increased API limits
- 💾 Local caching to prevent rate limiting
- 🌙 Dark mode support
- 🔄 Automatic fetching of all public repositories

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## Script Configuration

To make your scripts compatible with this dashboard, add special command tags in your repository's README.md file. The dashboard looks for two specific tags:

1. Installation Command:
```markdown
<!-- INSTALL_COMMAND: your-install-command-here -->
```

2. Run Command:
```markdown
<!-- RUN_COMMAND: your-run-command-here -->
```

### Example Repository README.md

Here's a complete example of how to configure your script's README:

```markdown
# My Node.js Script

A helpful utility for processing data files.

<!-- INSTALL_COMMAND: npm install -g data-processor -->
<!-- RUN_COMMAND: data-processor --input file.csv -->

## Features
- Fast processing
- Multiple format support
- Easy to use

## Documentation
...
```

When properly configured:
- The "Install Script" button will copy the installation command
- The "Run Script" button will copy the run command
- Both commands will be displayed in the script details panel

## GitHub Token (Optional)

To avoid rate limiting, you can provide a GitHub Personal Access Token:

1. Go to [GitHub Settings > Developer Settings > Personal Access Tokens](https://github.com/settings/tokens)
2. Generate a new token with `repo` scope
3. Use the token when prompted in the application

[![Netlify Status](https://api.netlify.com/api/v1/badges/d025b9a0-d60f-4d3b-9a43-aa6ebe6e0862/deploy-status)](https://app.netlify.com/sites/fluffy-pothos-14ce15/deploys)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
<!-- INSTALL_COMMAND: curl -L -o ScriptList-v1.0.0.zip https://github.com/mrdatawolf/ScriptList/archive/refs/tags/v1.0.0.zip -->

