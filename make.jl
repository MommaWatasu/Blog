using Documenter

makedocs(;
    sitename="HorseBlog",
    pages = [
        "Home" => "index.md",
        "MachineLearning" => [
            "HDBSCAN" => "MachineLearning/HDBSCAN.md"
        ]
        "FreeCraft" => [
            "最初に" => "FreeCraft/index.md",
            "1回目" => "FreeCraft/1st.md"
        ],
        "HorseOS" => [
            "HorseOSとは" => "HorseOS/index.md",
            "マウスを動かす" => "HorseOS/mouse.md"
        ]
    ]
)

deploydocs(
    repo = "github.com/MommaWatasu/Blog.git",
)