function escapeHtml(text) {
    return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
}

function highlight(code) {
    const keywords = new Set("import export from const let class extends return if else new this async await function".split(" "))
    const literals = new Set(["true", "false", "null"])
    let i = 0
    let out = ""

    while (i < code.length) {
        const rest = code.slice(i)

        if (rest.startsWith("//")) {
            const end = rest.indexOf("\n")
            const n = end === -1 ? rest.length : end
            out += '<span class="tok-c">' + escapeHtml(rest.slice(0, n)) + "</span>"
            i += n
            continue
        }

        const quote = rest[0]
        if (quote === '"' || quote === "'" || quote === "`") {
            let j = 1
            while (j < rest.length) {
                if (rest[j] === "\\") {
                    j += 2
                    continue
                }
                if (rest[j] === quote) {
                    j += 1
                    break
                }
                j += 1
            }
            out += '<span class="tok-s">' + escapeHtml(rest.slice(0, j)) + "</span>"
            i += j
            continue
        }

        if (/\d/.test(rest[0]) && (i === 0 || !/[A-Za-z_$]/.test(code[i - 1]))) {
            const num = rest.match(/^\d+(?:\.\d+)?/)[0]
            out += '<span class="tok-n">' + num + "</span>"
            i += num.length
            continue
        }

        const word = rest.match(/^[A-Za-z_$][\w$]*/)
        if (word) {
            const w = word[0]
            const after = code.slice(i + w.length)
            let cls = ""
            if (keywords.has(w)) cls = "tok-k"
            else if (literals.has(w)) cls = "tok-n"
            else if (/^[A-Z]/.test(w)) cls = "tok-cl"
            else if (/^\s*\(/.test(after)) cls = "tok-f"
            out += cls ? '<span class="' + cls + '">' + escapeHtml(w) + "</span>" : escapeHtml(w)
            i += w.length
            continue
        }

        out += escapeHtml(rest[0])
        i += 1
    }

    return out
}

function sun() {
    return '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="4" fill="currentColor"/><path stroke="currentColor" stroke-width="2" d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/></svg>'
}

function moon() {
    return '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
}

function paintTheme(theme) {
    document.documentElement.dataset.theme = theme
    localStorage.setItem("berry-site-theme", theme)
    const button = document.querySelector(".theme")
    if (!button) return
    const dark = theme !== "light"
    button.innerHTML = dark ? sun() : moon()
    button.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode")
}

function boot() {
    for (const link of document.querySelectorAll("[data-link]")) {
        const url = BERRY[link.dataset.link]
        if (!url) {
            link.removeAttribute("href")
            link.setAttribute("aria-disabled", "true")
            continue
        }
        link.href = url
    }

    for (const block of document.querySelectorAll(".code-window")) {
        const code = block.querySelector("code")
        const copy = block.querySelector(".copy-code")
        const raw = code.textContent.replace(/^\n/, "").replace(/\n$/, "")
        const name = block.querySelector(".code-name").textContent
        if (name !== "terminal") code.innerHTML = highlight(raw)
        copy.addEventListener("click", () => {
            navigator.clipboard.writeText(raw).then(() => {
                copy.textContent = "Copied!"
                setTimeout(() => { copy.textContent = "Copy code" }, 1200)
            }).catch(() => { copy.textContent = "Copy failed" })
        })
    }

    const saved = localStorage.getItem("berry-site-theme") || "dark"
    paintTheme(saved)
    document.querySelector(".theme").addEventListener("click", () => {
        paintTheme(document.documentElement.dataset.theme === "light" ? "dark" : "light")
    })

    const command = document.querySelector("[data-copy]")
    if (command) {
        command.addEventListener("click", () => {
            navigator.clipboard.writeText(command.dataset.copy).then(() => {
                command.textContent = "Copied"
                setTimeout(() => { command.textContent = "Copy" }, 1200)
            }).catch(() => { command.textContent = "Failed" })
        })
    }
}

boot()

