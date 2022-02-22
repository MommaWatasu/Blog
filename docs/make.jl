using Documenter

makedocs(;
    sitename="HorseBlog",
    pages = [
        "Home" => "index.md"
)

deploydocs(
    repo = "github.com/MommaWatasu/Blog.git",
)