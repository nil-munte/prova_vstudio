# Task Manager

Task Manager is a lightweight task management web app built with semantic HTML, modern CSS, and vanilla JavaScript.

## Features

- Add, complete, and delete tasks
- Filter tasks by All, Pending, and Completed
- Input validation (trims whitespace and blocks empty tasks)
- Task and theme persistence with localStorage
- Light and dark mode toggle
- Accessible interactions with ARIA live announcements
- Responsive layout for desktop and mobile

## Project Structure

- index.html: semantic page structure and UI markup
- styles.css: responsive styling and theme variables
- script.js: task logic, filtering, persistence, and accessibility behaviors

## Run Locally

1. Clone the repository.
2. Open the project folder.
3. Open index.html in your browser.

No build step or dependencies are required.

## Accessibility Notes

- Uses semantic landmarks (header, main, section)
- Includes ARIA labels for controls
- Announces task updates through a live region
- Respects reduced motion preferences

## Tech Stack

- HTML5
- CSS3
- JavaScript (ES6+)

## CI/CD Pipeline

This project uses GitHub Actions for continuous integration and deployment.

- CI workflow: `.github/workflows/ci.yml`
- CD workflow: `.github/workflows/deploy.yml`

### Continuous Integration (CI)

Runs on every push and pull request to `main`:

- Required file checks (`index.html`, `styles.css`, `script.js`)
- JavaScript syntax validation (`node --check`)
- HTML linting (`htmlhint`)

### Continuous Deployment (CD)

Runs on push to `main` (and manual trigger) and deploys the site to GitHub Pages.

To enable Pages deployment:

1. Open repository settings on GitHub.
2. Go to Pages.
3. Set Source to GitHub Actions.

