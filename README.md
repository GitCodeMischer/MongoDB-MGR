<div align="center">

# 📊 MongoDB Statistics

<img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white"/>
<img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white"/>
<img src="https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white"/>
<img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge"/>

**A modern, intuitive dashboard for real-time MongoDB monitoring and management**

[Features](#-features) •
[Quick Start](#-quick-start-with-docker) •
[Development](#-development) •
[Deployment](#-deployment) •
[Contributing](#-contributing) •
[License](#-license)

<img src="https://via.placeholder.com/800x400?text=MongoDB+Statistics+Dashboard" alt="MongoDB Statistics Dashboard Screenshot" width="80%"/>

</div>

---

## ✨ Features

<table>
  <tr>
    <td width="50%">
      <h3>🔍 Real-time Monitoring</h3>
      <ul>
        <li>Track server performance metrics</li>
        <li>Monitor operations and connections</li>
        <li>View real-time usage statistics</li>
      </ul>
    </td>
    <td width="50%">
      <h3>📊 Analytics Dashboard</h3>
      <ul>
        <li>Database size and growth metrics</li>
        <li>Document counts visualization</li>
        <li>Performance insights</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>🛡️ Secure Connectivity</h3>
      <ul>
        <li>Connect to any MongoDB instance</li>
        <li>Support for authentication</li>
        <li>Secure connection handling</li>
      </ul>
    </td>
    <td width="50%">
      <h3>🎨 Modern UI</h3>
      <ul>
        <li>Responsive, intuitive interface</li>
        <li>Dark/light mode support</li>
        <li>Built with Next.js</li>
      </ul>
    </td>
  </tr>
</table>

---

## 🚀 Quick Start with Docker

The easiest way to run MongoDB Statistics is using Docker:

<div class="highlight">

```bash
# Clone the repository
git clone https://github.com/yourusername/mongodb-statistics.git
cd mongodb-statistics

# Start the application (production mode)
docker-compose up -d

# Access the application at http://localhost:3000
```

</div>

---

## 🔄 Switching Between Docker Modes

The application includes helper scripts to easily switch between development and production modes:

<table>
<tr>
<th width="50%">Linux/Mac</th>
<th width="50%">Windows</th>
</tr>
<tr>
<td>

```bash
# Development mode
chmod +x docker-mode.sh
./docker-mode.sh dev

# Production mode
./docker-mode.sh prod

# Apply changes
docker-compose down && docker-compose up -d
```

</td>
<td>

```cmd
# Development mode
docker-mode.bat dev

# Production mode
docker-mode.bat prod

# Apply changes
docker-compose down
docker-compose up -d
```

</td>
</tr>
</table>

---

## 💻 Development

### Local Development

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at http://localhost:3000 with hot-reloading enabled.

### Docker Development Mode

Enable hot-reloading and volume mounting for development:

```bash
# Switch to development mode
./docker-mode.sh dev   # Linux/Mac
docker-mode.bat dev    # Windows

# Apply changes
docker-compose down && docker-compose up -d
```

<details>
<summary>What's included in development mode?</summary>

- 🔄 Hot reloading for instant feedback
- 📁 Volume mounting for real-time code changes
- ⚙️ Development environment settings
- 🛠️ Debugging support
  
</details>

---

## 🌐 Deployment

### Local Production Build

```bash
# Build the application
npm run build

# Start the production server
npm start
```

### Docker Production Deployment

The default configuration is set for production use:

```bash
# Switch to production mode (if needed)
./docker-mode.sh prod   # Linux/Mac
docker-mode.bat prod    # Windows

# Build and start the container
docker-compose up -d

# Access the application at http://localhost:3000
```

---

## 🔧 Troubleshooting Docker

<table>
  <tr>
    <th>Issue</th>
    <th>Solution</th>
  </tr>
  <tr>
    <td>Container not starting</td>
    <td><code>docker-compose logs</code> to view error messages</td>
  </tr>
  <tr>
    <td>Build failures</td>
    <td><code>docker-compose build --no-cache</code> to rebuild from scratch</td>
  </tr>
  <tr>
    <td>Invalid configuration</td>
    <td><code>docker-compose down -v && docker-compose up -d</code> to reset</td>
  </tr>
</table>

---

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create a feature branch: `git checkout -b amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin amazing-feature`
5. Open a Pull Request

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

- [MongoDB](https://www.mongodb.com/) - The database for modern applications
- [Next.js](https://nextjs.org/) - The React framework for production
- [Docker](https://www.docker.com/) - Container platform

---

<div align="center">

Made with ❤️ for the MongoDB community

[⬆ Back to top](#-mongodb-statistics)

</div> 