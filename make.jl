using Documenter

makedocs(;
    sitename="HorseBlog",
    pages = [
        "Home" => "index.md",
        "FreeCraft" => [
            "最初に" => "FreeCraft/index.html",
            "1回目" => "FreeCraft/1st.md"
        ]
    ]
)

deploydocs(
    repo = "github.com/MommaWatasu/Blog.git",
)