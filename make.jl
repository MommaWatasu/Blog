using Documenter

makedocs(;
    sitename="HorseBlog",
    pages = [
        "Home" => "index.md",
        "MachineLearning" => [
            "HDBSCAN" => "MachineLearning/HDBSCAN.md"
        ],
        "AGI" => [
            "AGIについて"　=> "AGI/index.md",
            "大脳皮質" => "AGI/CorticalColumn.md"
        ],
        "FreeCraft" => [
            "最初に" => "FreeCraft/index.md",
            "1回目" => "FreeCraft/1st.md"
        ],
        "HorseOS" => [
            "HorseOSとは" => "HorseOS/index.md",
            "マウスを動かす" => "HorseOS/mouse.md",
            "メモリ管理" => "HorseOS/memory.md",
            "重ね合わせ処理" => "HorseOS/layermanager1.md"
        ]
    ]
)

deploydocs(
    repo = "github.com/MommaWatasu/Blog.git",
)