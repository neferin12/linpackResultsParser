module.exports = {
    branches: ['main'],
    "plugins": [
        "@semantic-release/commit-analyzer",
        "@semantic-release/release-notes-generator",
        ["@semantic-release/github", {
            "assets": ["build/linux/linpackParser_linux", "build/macos/linpackParser_mac", "build/windows/linpackParser_win.exe"]
        }],
        ["@semantic-release/git", {
            "assets": ["package.json"],
            "message": "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
        }],
        "@semantic-release/npm"
    ],
    "preset": "angular"
}
