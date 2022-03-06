var documenterSearchIndex = {"docs":
[{"location":"FreeCraft/1st/#FreeCraft作成一回目(2022/2/22)","page":"1回目","title":"FreeCraft作成一回目(2022/2/22)","text":"","category":"section"},{"location":"FreeCraft/1st/#準備","page":"1回目","title":"準備","text":"","category":"section"},{"location":"FreeCraft/1st/","page":"1回目","title":"1回目","text":"まずは使う言語を決めることになるわけなんですが、まあ、ゲームなのでコンパイル言語のほうがいいだろうということで、Rustにしました（基本的にC系は好きじゃないので、勉強してないので）。 そんで、Rustには3D描画できるライブラリというのは結構あるんですが、ゲームエンジンの中で使えるものはPistonとAmethystに絞られます。Pistonは調べてみたんですが、あまり3D描画に関するDocsが見つからなかったので、Amethystでやることにしました。それでもなかなか情報を探すのに苦労するので、参考になればと思います。","category":"page"},{"location":"FreeCraft/1st/#とりあえずプロジェクトを作成","page":"1回目","title":"とりあえずプロジェクトを作成","text":"","category":"section"},{"location":"FreeCraft/1st/","page":"1回目","title":"1回目","text":"とりあえずCargoでプロジェクトを作ります。","category":"page"},{"location":"FreeCraft/1st/","page":"1回目","title":"1回目","text":"$ cargo new FreeCraft --bin","category":"page"},{"location":"FreeCraft/1st/","page":"1回目","title":"1回目","text":"そんで、Cargo.tomlを書いておきます。","category":"page"},{"location":"FreeCraft/1st/","page":"1回目","title":"1回目","text":"[package]\nname = \"freecraft\"\nversion = \"0.1.0\"\nedition = \"2021\"\n\n# See more keys and their definitions at https://doc.rust-lang.org/cargo/reference/manifest.html\n\n[dependencies]\namethyst = {version=\"0.15.0\", features=[\"vulkan\"]}","category":"page"},{"location":"FreeCraft/1st/","page":"1回目","title":"1回目","text":"そしてとりあえずcargo buildするわけなんですが、多分一発では通りません（通ったら運が良いと思います）。","category":"page"},{"location":"FreeCraft/1st/","page":"1回目","title":"1回目","text":"まずはここで出るコンパイルエラー達をさばきましょう(申し訳ないんですが、ここはあんまり記録撮ってないので記憶で書きます)。","category":"page"},{"location":"FreeCraft/1st/#alsaに関するエラー","page":"1回目","title":"alsaに関するエラー","text":"","category":"section"},{"location":"FreeCraft/1st/","page":"1回目","title":"1回目","text":"筆者はこれでまず一回コンパイルが止まったんですがalsaなるパッケージがないよ、みたいなエラーで止まる症状が出ることがあります。 これは冷静にalsaをaptで入れてやりましょう。","category":"page"},{"location":"FreeCraft/1st/#error:-linking-with-cc-failed:-exit-code:-1","page":"1回目","title":"error: linking with cc failed: exit code: 1","text":"","category":"section"},{"location":"FreeCraft/1st/","page":"1回目","title":"1回目","text":"こいつはなんか大量のエラーが図れるので気が滅入りますが、こういうとてつもないエラーは最後が肝心。 1つ目のnoteを無視して、2つ目のnoteを見てみるとcannot find ~みたいに書いてあると思います。この~の部分の頭は代替lで始まってるんですが、このlのあとをapt list | grep ~して、devってついてる物を見つけてインストールしてやりましょう。","category":"page"},{"location":"FreeCraft/1st/","page":"1回目","title":"1回目","text":"多分ここまででAmethystのコンパイルが通るとこまでは行ったと思います。次はとりあえず3D描画します。","category":"page"},{"location":"FreeCraft/1st/#Cubeの表示","page":"1回目","title":"Cubeの表示","text":"","category":"section"},{"location":"FreeCraft/1st/","page":"1回目","title":"1回目","text":"Minecraftの基礎であるCubeを表示してみましょう。ここで、Amethyst 3D Exampleとかって調べるんですが、公式レポにあるExampleは説明なしのコードだけでよくわかりません。 なので、とりあえずここにコード置いて置きます。これはスケルトンなので呪文だと思っておきましょう。","category":"page"},{"location":"FreeCraft/1st/","page":"1回目","title":"1回目","text":"use amethyst::{\n    assets::{AssetLoaderSystemData},\n    core::{Transform, TransformBundle},\n    renderer::{\n        plugins::{\n            RenderPbr3D,\n            RenderToWindow\n        },\n        rendy::{\n            mesh::{Normal, Position, Tangent, TexCoord},\n        },\n        light::{Light, PointLight},\n        palette::rgb::Rgb,\n        shape::Shape,\n        types::DefaultBackend,\n        Camera,\n        Material,\n        MaterialDefaults,\n        Mesh,\n        RenderingBundle\n    },\n    prelude::{\n        Builder,\n        World,\n        WorldExt\n    },\n    utils::application_root_dir,\n    Application,\n    GameData,\n    GameDataBuilder,\n    SimpleState,\n    StateData\n};\n\nstruct FreeCraft;\nimpl SimpleState for FreeCraft {\n    fn on_start(&mut self, state_data: StateData<'_, GameData<'_, '_>>) {\n        initialize_camera(state_data.world);\n        initialize_cube(state_data.world);\n        initialize_light(state_data.world);\n    }\n}\n\nfn main() -> amethyst::Result<()> {\n    // Logger\n    amethyst::start_logger(Default::default());\n\n    // assets directry\n    let app_root = application_root_dir()?;\n    let assets_dir = app_root.join(\"assets\");\n    \n    // GameDataBuilder\n    let display_config_path = app_root.join(\"config/display.ron\");\n    let game_data = GameDataBuilder::default()\n        .with_bundle(TransformBundle::new())?\n        .with_bundle(\n            RenderingBundle::<DefaultBackend>::new()\n                .with_plugin(\n                    RenderToWindow::from_config_path(display_config_path)?\n                        .with_clear([0.529, 0.808, 0.98, 1.0]),\n                )\n                .with_plugin(RenderPbr3D::default()),\n        )?;\n    \n    let mut game = Application::new(assets_dir, FreeCraft, game_data)?;\n    game.run();\n    \n    Ok(())\n}\n\nfn initialize_camera(world: &mut World) {\n    let mut transform = Transform::default();\n    transform.set_translation_xyz(0.0, 0.0, 10.0);\n    world.create_entity()\n        .with(Camera::standard_3d(1024.0, 768.0))\n        .with(transform)\n        .build();\n}\n\nfn initialize_cube(world: &mut World) {\n    let mesh = world.exec(|loader: AssetLoaderSystemData<'_, Mesh>| {\n        loader.load_from_data(\n            Shape::Cube\n                .generate::<(Vec<Position>, Vec<Normal>, Vec<Tangent>, Vec<TexCoord>)>(None)\n                .into(),\n            (),\n        )\n    });\n\n    let material_defaults = world.read_resource::<MaterialDefaults>().0.clone();\n    let material = world.exec(|loader: AssetLoaderSystemData<'_, Material>| {\n        loader.load_from_data(\n                Material {\n                    ..material_defaults\n                },\n                (),\n            )\n        },\n    );\n    \n    let mut transform = Transform::default();\n    transform.set_translation_xyz(0.0, 0.0, 0.0);\n\n    world.create_entity()\n        .with(mesh)\n        .with(material)\n        .with(transform)\n        .build();\n}\n\nfn initialize_light(world: &mut World) {\n    let light: Light = PointLight {\n        intensity: 10.0,\n        color: Rgb::new(1.0, 1.0, 1.0),\n        ..PointLight::default()\n    }.into();\n\n    let mut transform = Transform::default();\n    transform.set_translation_xyz(5.0, 5.0, 20.0);\n\n    world\n        .create_entity()\n        .with(light)\n        .with(transform)\n        .build();\n}","category":"page"},{"location":"FreeCraft/1st/","page":"1回目","title":"1回目","text":"結構長いですが、こいつをcargo runすれば光があたった立方体がそれっぽい背景色と共に表示されるはずです。","category":"page"},{"location":"FreeCraft/#FreeCraft","page":"最初に","title":"FreeCraft","text":"","category":"section"},{"location":"FreeCraft/","page":"最初に","title":"最初に","text":"ゲームプログラミングをやってみたいなーと思って、どんなゲームを作ろうか考えたんですが、せっかくなら3Dゲームがいい、それならMinecraftかなーと言うことで自作してみることにしました。","category":"page"},{"location":"FreeCraft/#目次","page":"最初に","title":"目次","text":"","category":"section"},{"location":"FreeCraft/","page":"最初に","title":"最初に","text":"Pages = [\n    \"FreeCraft/1st.md\"\n]\nDepth = 1","category":"page"},{"location":"HorseOS/mouse/#マウスを動かすまで","page":"マウスを動かす","title":"マウスを動かすまで","text":"","category":"section"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"Mikan本持ってない方でもわかるようHello Worldは書いておきます。","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"まず、「OSを作る」と言われても、どう動くものかイメージがつかないとやってられないと思います。大雑把な流れとしては、","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"BIOSがIPL(Initial Program Loader)を呼び出す。こいつはUSBメモリの中の/EFI/BOOT/BOOTX64.efiであることになってる。\nIPLがUEFIのboot service(標準出力などを一時的に提供してくれる)を使ってメモリマップの書き込みを行う\nIPLからカーネルを呼び出す。このときUEFIは邪魔にならないよう切っておく。\nカーネルが動き始める。","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"といった感じです。Hello Worldやったあとは、ちょっと長くなる（そしてIntelのおじさんが決めたからシリーズ）ので、マウスを動かすまで若干省きます。","category":"page"},{"location":"HorseOS/mouse/#Hello-World","page":"マウスを動かす","title":"Hello World","text":"","category":"section"},{"location":"HorseOS/mouse/#準備","page":"マウスを動かす","title":"準備","text":"","category":"section"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"Hello Worldするのにも準備が必要です（なんだかんだここが一番つまんない気がします）。 まず、Rustの最新バージョンを使う必要があるので、rustup default nightlyしておきます。 そして、リンクにLLVMが後々必要になるので入れちゃいます。","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"$ sudo apt install lld","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"テスト環境としてQEMUを使いたいので、インストールします。","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"$ sudo apt install qemu\n$ sudo apt install qemu-utils\n$ sudo apt install qemu-system-x86","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"更に、QEMUを動かすのにOVFMなるファイルが必要になるのですが、面倒くさいので僕のリポジトリの/dev-toolsから持ってきてください（両方です）。","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"また、Rustも発達途中で、いろいろエラーが出るかもしれませんが、そのときはコンパイラのnoteやらhelpを見ましょう。Rustのコンパイラは本当に親切です。","category":"page"},{"location":"HorseOS/mouse/#IPL","page":"マウスを動かす","title":"IPL","text":"","category":"section"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"準備は先ほどしたんですが、Cargoの設定はまだ残っています。 まずプロジェクトを作って","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"$ cargo new [ブートローダのプロジェクト名] -bin","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"Cargo.tomlをこんな感じに（適宜読み変えてください）します。","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"[package]\nname = \"horse-bootloader\"\nversion = \"0.1.0\"\nedition = \"2021\"\n\n# See more keys and their definitions at https://doc.rust-lang.org/cargo/reference/manifest.html\n\n[dependencies]\nuefi = { version = \"0.10.0\", features = [\"exts\", \"alloc\", \"logger\"] }\nlog = { version = \"0.4.11\", default-features = false }\nelf_rs = \"0.1\"","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"更に.cargo/config.tomlをこんな感じで","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"[build]\ntarget = \"x86_64-unknown-uefi\"\n\n[unstable]\nbuild-std = [\"core\", \"alloc\", \"compiler_builtins\"]\nbuild-std-features = [\"compiler-builtins-mem\"]","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"これでやっと本題です。IPLのプログラム(src/main.rs)をこんな感じで書いてください","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"#![feature(abi_efiapi)]\n#![feature(alloc_error_handler)]\n#![no_std]\n#![no_main]\n\n#[macro_use]\nextern crate alloc;\nuse alloc::string::ToString;\nuse core::arch::asm;\nuse console::gop;\nuse log;\nuse core::fmt::Write;\nuse elf_rs::*;\nuse proto::console;\nuse uefi::{\n    prelude::*,\n    proto::{self, console::gop::GraphicsOutput, media::fs::SimpleFileSystem},\n    table::boot::{EventType, MemoryDescriptor, Tpl},\n};\nuse uefi::{\n    proto::media::file::{File, FileAttribute, FileInfo, FileMode, FileType::Regular},\n    table::boot::{AllocateType, MemoryType},\n};\n\nstatic mut LOGGER: Option<uefi::logger::Logger> = None\n\n#[entry]\nfn efi_main(handle: Handle, st: SystemTable<Boot>) -> Status {\n    let bt = st.boot_services();\n    let stdout = st.stdout();\n    \n    writeln!(stdout, \"booting HorseOS...\").unwrap();\n}","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"これで","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"$ cargo build","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"して、target/x86_64-unkown-uefi/debugからEFIファイルを持ってきます。 ここから黙々とコマンドを叩いていけばHello Worldと出会えるはず。。。（だめだったらここは他のサイト見てください、だいぶ立ってから書いてるので記憶が薄れてるので）","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"$ qemu-img create -f raw disk.iso 200M\n$ mkfs.fat -n 'HORSE OS' -s 2 -f 2 -R 32 -F 32\n$ mkdir -p mnt\n$ sudo mount -o loop disk.iso mnt\n$ sudo mkdir -p mnt/EFI/BOOT\n$ sudo cp bootloader.efi  mnt/EFI/BOOT/BOOTX64.EFI\n$ sudo umount mnt\n$ qemu-system-x86_64 \\\n    -m 1G \\\n    -drive if=pflash,format=raw,readonly,file=./dev-tools/OVMF/OVMF_CODE.fd \\\n    -drive if=pflash,format=raw,file=./dev-tools/OVMF/OVMF_VARS.fd \\\n    -drive if=ide,index=0,media=disk,format=raw,file=disk.iso \\\n    -device nec-usb-xhci,id=xhci \\\n    -device usb-mouse -device usb-kbd \\\n    -monitor stdio \\","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"ふう、こんな画面が見えましたか？ (Image: Hello World) まあ、ここは感動するための手続きみたいなもんなので、駄目なら駄目でさっさと次に進んでしまいましょう。 なお、僕のようにお馬鹿な人ばかりではないと思いますが、QEMUの画面でマウスをキャプチャして「抜け出せない！」などとならないようにしましょう、ダサすぎるので。Windowのタイトルに書いてありますが、Ctrl+Alt+Gで抜けられます。","category":"page"},{"location":"HorseOS/mouse/#カーネルを呼び出してみよう","page":"マウスを動かす","title":"カーネルを呼び出してみよう","text":"","category":"section"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"面倒くさいのでIPLの詳細は省きます。興味のある人はコードを読んだり他のサイトを探してください（カーネル本体書き始めるまではほんとにやるだけです）。 というわけでIPLを僕のリポジトリから引っ張って来て、魔改造してあげましょう。","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"そして、カーネルのテンプレも作りましょう（OSの名前はよく考えましょう、愛着の湧くように）。","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"$ cargo new [OSの名前] -bin","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"そして、カーネルのビルドはIPLよりひと手間増えます。僕のリポジトリからターゲットファイルを取って来て、プロジェクト直下に置いといてください。 そしてCargo.tomlを","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"[package]\nname = \"horse-kernel\"\nversion = \"0.1.0\"\nedition = \"2021\"\n\n# See more keys and their definitions at https://doc.rust-lang.org/cargo/reference/manifest.html\n\n[dependencies]\nx86_64 = \"0.14.1\"\nspin = { version = \"0.9.0\", features = [\"lock_api\", \"mutex\"] }\n\n[profile.dev]\npanic=\"abort\"","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":".cargo/config.tomlを","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"[build]\ntarget = \"x86_64-unknown-none-horsekernel.json\"\n\n[unstable]\nbuild-std = [\"core\", \"compiler_builtins\"]\nbuild-std-features = [\"compiler-builtins-mem\"]","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"こうして準備完了です。src/main.rsにカーネルの土台を書きます。","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"#![no_std]\n#![no_main]\n#![feature(abi_efiapi)]\n\n#[no_mangle]\nextern \"sysv64\" fn kernel_main(fb: *mut FrameBuffer, mi: *mut ModeInfo) -> ! {\n    loop {\n        unsafe {\n            asm!(\"hlt\")\n        }\n    }\n}","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"とりあえずCPUを休ませるだけですが、ひとつだけ説明する必要があるのは、extern \"sysv64\"ですが、Rustでプログラムを書くと、余計な情報がついてしまうようで、そのままだとIPLが上手くこの関数を呼び出せません、そこで、Cのように不要なものの内容にするために指定しています。 このあとプログラムを読めば解ると思いますが、ところどころCに合わせるために細工がされています。","category":"page"},{"location":"HorseOS/mouse/#マウスを動かそう","page":"マウスを動かす","title":"マウスを動かそう","text":"","category":"section"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"マウスを動かすまでにいろいろあるんですが、こういう技術的な解説を書こうとするとまさにMikan本のようなものすごく長いものになってしまうので、大幅カットで一気にマウスを動かすところまで行きます。 で、ちょっとこっから先はコードが長いので、GitHubからcloneしてください。","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"$ git clone https://github.com/MommaWatasu/Horse.git","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"そして、マウスを動かすためにチェックアウトします。","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"$ git checkout ba6648e","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"だいぶいろいろ追加されてますが、だいたいこんなものが追加されてます。","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"dev-tools: ビルド関係のファイル\nMakefile.toml: Cargo-makeの設定ファイル、こいつのおかげであの冗長なコマンドを打たなくて済む。入れてない人はCargo-makeを入れておきましょう。\nkernel: カーネルとその他愉快な仲間たち(usbディレクトリにUSB ホストドライバが入ってます。)","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"説明が面倒くさいのでこれ以上の説明はしませんが、なんとなく一度コードを眺めて何をしているのかぐらいは見ておいた方がいいと思います。僕も他の方のコードを眺めて大体関係性をりかいしたので。ファイル名から何やってるか察する事も多いと思いますしね。","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"さて、皆さんお待ちかねのマウス君とキーボード君の登場です。","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"$ makers RUN","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"するとあら不思議、マウスがちゃんと動き、キーボードも入力した文字が表示されるではありませんか！ (Image: Mouse and Keyboard) これは感動しましたよ。こういうの見ると、開発し続けるやる気が湧いてきます。 ただ、お気づきかと思いますが、マウスが端に寄せたときに隠れないなどの不自然なところはありますが、このへんは少し面倒なので後回し。","category":"page"},{"location":"HorseOS/mouse/#おまけ","page":"マウスを動かす","title":"おまけ","text":"","category":"section"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"実機で動かしているの図、古いパソコンと古いUSBがあったらぜひやってみてください、LinuxのUSBライタでdisk.isoを書き込んで、BIOSでセキュアブートをオフにした上で起動順位さえ変えれば簡単にできます。 (Image: real-machine)","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"XHCIの設定周りのテストをしているの図、この辺はMikan本を読みながらやれるといいです。 (Image: XHCI)","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"ビルドのビフォーアフター、僕はホストドライバをmandarinOSという他の方が書いたものから取ってきたんですが（先人は偉大）、これの写経をしていて、大量のバグが出ました。前と後のスクロールバーの大きさでわかるかと思います。。。みなさんもOS作りをするときは無理そうならコピペしましょう。 (Image: build)","category":"page"},{"location":"#Horse-Blog","page":"Home","title":"Horse Blog","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"このブログは、MommaWatasuが備忘録的な感じで自分で書いたプログラムとかについて適当に書いてます。 使ってる言語は","category":"page"},{"location":"","page":"Home","title":"Home","text":"Julia\nRust(習得中)\nPython\nその他愉快な仲間たち（HTML等々）","category":"page"},{"location":"","page":"Home","title":"Home","text":"って感じです。 機械学習とかOS開発とかゲームプログラミングとかをやってるので、参考になれば良いです（結構OS開発なんかは日本語の情報が少ないので、奮闘してます）。 なお、JuliaのDocumenter.jl使ってる影響でドキュメント調なのは気にしない。","category":"page"},{"location":"HorseOS/#HorseOS","page":"HorseOSとは","title":"HorseOS","text":"","category":"section"},{"location":"HorseOS/","page":"HorseOSとは","title":"HorseOSとは","text":"僕は何故か最初にプログラミングに使ったマシンがLinuxだったことで、Linux信者になり。ノートパソコンにもWIndowsを消してLinux Mint入れてるんですが。 Linuxを使ってると、Windowsを使うのに比べかなりメタなところが垣間見えます。そうして何度も見ているうちに、OSを作ってみたいという気持ちが湧いてきたので、作り始めました。 それと、このOS作りを行う上で非常に参考にさせていただいているMikan本はじめ多くの先人たちはCでOSを作ってるんですが、Rustは安全で書きやすいというのをよく目にするので、ちょうど低レイヤーということで、 Rustの習得も兼ねてやってます。","category":"page"},{"location":"HorseOS/","page":"HorseOSとは","title":"HorseOSとは","text":"そんなわけでかなり数少ないRust製のOSなので、そんなに大したものではないとはいえ、参考になれば幸いです。 なお、なにかHorseOSに関して、OS作りに関して聞きたいこと等あれば、お気軽にリポジトリのissueに日本語で構わないので書いてください。","category":"page"}]
}
