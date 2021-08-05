module.exports = {
    branches: "master",
    repositoryUrl: "https://github.com/Uninett/Argus-frontend",
    plugins: [
        "@semantic-release/commit-analyzer",
        "@semantic-release/release-notes-generator",
        "@semantic-release/github"
    ]
}