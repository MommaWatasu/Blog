var documenterSearchIndex = {"docs":
[{"location":"FreeCraft/1st/#FreeCraft作成一回目(2022/3/17)","page":"1回目","title":"FreeCraft作成一回目(2022/3/17)","text":"","category":"section"},{"location":"FreeCraft/1st/#準備","page":"1回目","title":"準備","text":"","category":"section"},{"location":"FreeCraft/1st/","page":"1回目","title":"1回目","text":"まずは使う言語を決めることになるわけなんですが、まあ、ゲームなのでコンパイル言語のほうがいいだろうということで、Rustにしました（基本的にC系は好きじゃないので、勉強してないので）。 そんで、Rustには3D描画できるライブラリというのはPiston、Amethyst、RG3Dと言った選択肢があるんですが、PistonはDocsがよくわからず、Amethsyはバグがあるのに、レポジトリが「InActivity Mainteined」となっていて、ダメそう。ということでRG3Dを使って作っていきます。","category":"page"},{"location":"FreeCraft/1st/#とりあえずプロジェクトを作成","page":"1回目","title":"とりあえずプロジェクトを作成","text":"","category":"section"},{"location":"FreeCraft/1st/","page":"1回目","title":"1回目","text":"とりあえずCargoでプロジェクトを作ります。","category":"page"},{"location":"FreeCraft/1st/","page":"1回目","title":"1回目","text":"$ cargo new FreeCraft --bin","category":"page"},{"location":"FreeCraft/1st/","page":"1回目","title":"1回目","text":"そんで、Cargo.tomlを書いておきます。","category":"page"},{"location":"FreeCraft/1st/","page":"1回目","title":"1回目","text":"[package]\nname = \"freecraft\"\nversion = \"0.1.0\"\nedition = \"2021\"\n\n# See more keys and their definitions at https://doc.rust-lang.org/cargo/reference/manifest.html\n\n[dependencies]\nfyrox = \"0.24.0\"","category":"page"},{"location":"FreeCraft/1st/","page":"1回目","title":"1回目","text":"そしてとりあえずcargo buildするわけなんですが、多分一発では通りません（通ったら運が良いと思います）。","category":"page"},{"location":"FreeCraft/1st/","page":"1回目","title":"1回目","text":"まずはここで出るコンパイルエラー達をさばきましょう(申し訳ないんですが、ここはあんまり記録撮ってないので記憶で書きます)。","category":"page"},{"location":"FreeCraft/1st/#alsaに関するエラー","page":"1回目","title":"alsaに関するエラー","text":"","category":"section"},{"location":"FreeCraft/1st/","page":"1回目","title":"1回目","text":"筆者はこれでまず一回コンパイルが止まったんですがalsaなるパッケージがないよ、みたいなエラーで止まる症状が出ることがあります。 これは冷静にalsaをaptで入れてやりましょう。","category":"page"},{"location":"FreeCraft/1st/#error:-linking-with-cc-failed:-exit-code:-1","page":"1回目","title":"error: linking with cc failed: exit code: 1","text":"","category":"section"},{"location":"FreeCraft/1st/","page":"1回目","title":"1回目","text":"こいつはなんか大量のエラーが図れるので気が滅入りますが、こういうとてつもないエラーは最後が肝心。 1つ目のnoteを無視して、2つ目のnoteを見てみるとcannot find ~みたいに書いてあると思います。この~の部分の頭は代替lで始まってるんですが、このlのあとをapt list | grep ~して、devってついてる物を見つけてインストールしてやりましょう。","category":"page"},{"location":"FreeCraft/1st/","page":"1回目","title":"1回目","text":"多分ここまででRG3Dのコンパイルが通るとこまでは行ったと思います。次はとりあえず3D描画します。","category":"page"},{"location":"FreeCraft/1st/#Hello-World","page":"1回目","title":"Hello World","text":"","category":"section"},{"location":"FreeCraft/1st/","page":"1回目","title":"1回目","text":"じゃあRG3Dの使い方を説明しよう！ってことになるんですが、結構コードが長くてコードとともに解説するのは難しいので、大体の説明は公式チュートリアルを見てもらうことにして、補足的な説明をします。","category":"page"},{"location":"FreeCraft/1st/#ブロックを表示したい","page":"1回目","title":"ブロックを表示したい","text":"","category":"section"},{"location":"FreeCraft/1st/","page":"1回目","title":"1回目","text":"ブロックを表示するのには、手続き型（プログラムで記述する）方法と3Dモデルをロードする方法があります。最初は手続き型の方が何かと便利だと思っていたのですが、やってみると各面に異なるテクスチャを貼ることができないようなんです。あと、3Dモデルの方が何かと編集するのとかが便利なので、3Dモデルを予めBlenderで作っておいて、それをロードするようにします。 ここで注意点があります、チュートリアル通りにメッシュを作成しただけではブロックを自分が透過してしまいます。これを解決するには、ブロックのメッシュにColliderと呼ばれるものを設定する必要があります。これにより、メッシュに当たり判定が作られ、近づくと、カメラのColliderとぶつかって透過しなくなります。 また、マイクラでは重力に従うブロックと従わないブロックがありますが、RigidBodyにはデフォルトで重力などが働くため、外部からの力によって動かないようにRigidBodyTypeとしてStaticを指定してやる必要があります。","category":"page"},{"location":"FreeCraft/1st/","page":"1回目","title":"1回目","text":"ここまでの内容を考慮して、以下のような関数を作りました。","category":"page"},{"location":"FreeCraft/1st/","page":"1回目","title":"1回目","text":"async fn load_model_to_scene(\n    scene: &mut Scene,\n    path: &str,\n    resource_manager: &ResourceManager,\n    position: (f32, f32, f32)\n) -> Handle<Node> {\n    // Request model resource and block until it loading. \n    let model_resource =\n        resource_manager.request_model(Path::new(&path))\n            .await\n            .unwrap();\n\n    RigidBodyBuilder::new(\n        BaseBuilder::new()\n            .with_local_transform(\n                TransformBuilder::new()\n                    // Offset player a bit.\n                    .with_local_position(Vector3::new(position.0, position.1, position.2))\n                    .build(),\n            )\n            .with_children(&[\n                // Create an instance of the resource in the scene. \n                model_resource.instantiate_geometry(scene),\n                // Add capsule collider for the rigid body.\n                ColliderBuilder::new(BaseBuilder::new())\n                    .with_shape(ColliderShape::cuboid(0.25, 0.25, 0.25))\n                    .build(&mut scene.graph)\n            ]),\n    )\n    // We don't want the player to tilt.\n    .with_locked_rotations(true)\n    // We don't want the rigid body to sleep (be excluded from simulation)\n    .with_can_sleep(false)\n    // We don't want the block to move\n    .with_body_type(RigidBodyType::Static)\n    .build(&mut scene.graph)\n}","category":"page"},{"location":"FreeCraft/1st/","page":"1回目","title":"1回目","text":"この関数はpositionにx座標、y座標、z座標のタプルを渡すと、指定した座標に土ブロックを表示してくれます。","category":"page"},{"location":"FreeCraft/1st/#テクスチャの修正","page":"1回目","title":"テクスチャの修正","text":"","category":"section"},{"location":"FreeCraft/1st/","page":"1回目","title":"1回目","text":"先程のコードでブロックの描画自体はできるんですが、元画像が16ピクセルなので、テクスチャがぼやけます。では、ぼやけるのを治すのにはどうしたらいいかというと、テクスチャを読み込む際のオプションを*.png.optionにかけるので、ここで修正するように設定しておきます。 このようにしてください","category":"page"},{"location":"FreeCraft/1st/","page":"1回目","title":"1回目","text":"(\n    minification_filter: Nearest,\n    magnification_filter: Nearest,\n    s_wrap_mode: Repeat,\n    t_wrap_mode: ClampToEdge,\n    anisotropy: 8.0,\n    compression: NoCompression,    \n)","category":"page"},{"location":"FreeCraft/1st/","page":"1回目","title":"1回目","text":"このうち、","category":"page"},{"location":"FreeCraft/1st/","page":"1回目","title":"1回目","text":"minification_filter: Nearest,\nmagnification_filter: Nearest,","category":"page"},{"location":"FreeCraft/1st/","page":"1回目","title":"1回目","text":"が重要です。これによりテクスチャを読み込むときに勝手に修正してくれます。","category":"page"},{"location":"FreeCraft/1st/#最後に","page":"1回目","title":"最後に","text":"","category":"section"},{"location":"FreeCraft/1st/","page":"1回目","title":"1回目","text":"今回はどうやってブロックを描画するのかまでを書きました。次回は今ある当たり判定の不自然さを直して、ブロックをバリエーションを増やしてそれっぽくしていこうと思います。","category":"page"},{"location":"FreeCraft/#FreeCraft","page":"最初に","title":"FreeCraft","text":"","category":"section"},{"location":"FreeCraft/","page":"最初に","title":"最初に","text":"ゲームプログラミングをやってみたいなーと思って、どんなゲームを作ろうか考えたんですが、せっかくなら3Dゲームがいい、それならMinecraftかなーと言うことで自作してみることにしました。","category":"page"},{"location":"FreeCraft/#目次","page":"最初に","title":"目次","text":"","category":"section"},{"location":"FreeCraft/","page":"最初に","title":"最初に","text":"Pages = [\n    \"FreeCraft/1st.md\"\n]\nDepth = 1","category":"page"},{"location":"HorseOS/mouse/#マウスを動かすまで","page":"マウスを動かす","title":"マウスを動かすまで","text":"","category":"section"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"Mikan本持ってない方でもわかるようHello Worldは書いておきます。","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"まず、「OSを作る」と言われても、どう動くものかイメージがつかないとやってられないと思います。大雑把な流れとしては、","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"BIOSがIPL(Initial Program Loader)を呼び出す。こいつはUSBメモリの中の/EFI/BOOT/BOOTX64.efiであることになってる。\nIPLがUEFIのboot service(標準出力などを一時的に提供してくれる)を使ってメモリマップの書き込みを行う\nIPLからカーネルを呼び出す。このときUEFIは邪魔にならないよう切っておく。\nカーネルが動き始める。","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"といった感じです。Hello Worldやったあとは、ちょっと長くなる（そしてIntelのおじさんが決めたからシリーズ）ので、マウスを動かすまで若干省きます。","category":"page"},{"location":"HorseOS/mouse/#Hello-World","page":"マウスを動かす","title":"Hello World","text":"","category":"section"},{"location":"HorseOS/mouse/#準備","page":"マウスを動かす","title":"準備","text":"","category":"section"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"Hello Worldするのにも準備が必要です（なんだかんだここが一番つまんない気がします）。 まず、Rustの最新バージョンを使う必要があるので、rustup default nightlyしておきます。 そして、リンクにLLVMが後々必要になるので入れちゃいます。","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"$ sudo apt install lld","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"テスト環境としてQEMUを使いたいので、インストールします。","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"$ sudo apt install qemu\n$ sudo apt install qemu-utils\n$ sudo apt install qemu-system-x86","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"更に、QEMUを動かすのにOVFMなるファイルが必要になるのですが、面倒くさいので僕のリポジトリの/dev-toolsから持ってきてください（両方です）。","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"また、Rustも発達途中で、いろいろエラーが出るかもしれませんが、そのときはコンパイラのnoteやらhelpを見ましょう。Rustのコンパイラは本当に親切です。","category":"page"},{"location":"HorseOS/mouse/#IPL","page":"マウスを動かす","title":"IPL","text":"","category":"section"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"準備は先ほどしたんですが、Cargoの設定はまだ残っています。 まずプロジェクトを作って","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"$ cargo new [ブートローダのプロジェクト名] -bin","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"Cargo.tomlをこんな感じに（適宜読み変えてください）します。","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"[package]\nname = \"horse-bootloader\"\nversion = \"0.1.0\"\nedition = \"2021\"\n\n# See more keys and their definitions at https://doc.rust-lang.org/cargo/reference/manifest.html\n\n[dependencies]\nuefi = { version = \"0.10.0\", features = [\"exts\", \"alloc\", \"logger\"] }\nlog = { version = \"0.4.11\", default-features = false }\nelf_rs = \"0.1\"","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"更に.cargo/config.tomlをこんな感じで","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"[build]\ntarget = \"x86_64-unknown-uefi\"\n\n[unstable]\nbuild-std = [\"core\", \"alloc\", \"compiler_builtins\"]\nbuild-std-features = [\"compiler-builtins-mem\"]","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"これでやっと本題です。IPLのプログラム(src/main.rs)をこんな感じで書いてください","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"#![feature(abi_efiapi)]\n#![feature(alloc_error_handler)]\n#![no_std]\n#![no_main]\n\n#[macro_use]\nextern crate alloc;\nuse alloc::string::ToString;\nuse core::arch::asm;\nuse console::gop;\nuse log;\nuse core::fmt::Write;\nuse elf_rs::*;\nuse proto::console;\nuse uefi::{\n    prelude::*,\n    proto::{self, console::gop::GraphicsOutput, media::fs::SimpleFileSystem},\n    table::boot::{EventType, MemoryDescriptor, Tpl},\n};\nuse uefi::{\n    proto::media::file::{File, FileAttribute, FileInfo, FileMode, FileType::Regular},\n    table::boot::{AllocateType, MemoryType},\n};\n\nstatic mut LOGGER: Option<uefi::logger::Logger> = None\n\n#[entry]\nfn efi_main(handle: Handle, st: SystemTable<Boot>) -> Status {\n    let bt = st.boot_services();\n    let stdout = st.stdout();\n    \n    writeln!(stdout, \"booting HorseOS...\").unwrap();\n}","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"これで","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"$ cargo build","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"して、target/x86_64-unkown-uefi/debugからEFIファイルを持ってきます。 ここから黙々とコマンドを叩いていけばHello Worldと出会えるはず。。。（だめだったらここは他のサイト見てください、だいぶ立ってから書いてるので記憶が薄れてるので）","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"$ qemu-img create -f raw disk.iso 200M\n$ mkfs.fat -n 'HORSE OS' -s 2 -f 2 -R 32 -F 32\n$ mkdir -p mnt\n$ sudo mount -o loop disk.iso mnt\n$ sudo mkdir -p mnt/EFI/BOOT\n$ sudo cp bootloader.efi  mnt/EFI/BOOT/BOOTX64.EFI\n$ sudo umount mnt\n$ qemu-system-x86_64 \\\n    -m 1G \\\n    -drive if=pflash,format=raw,readonly,file=./dev-tools/OVMF/OVMF_CODE.fd \\\n    -drive if=pflash,format=raw,file=./dev-tools/OVMF/OVMF_VARS.fd \\\n    -drive if=ide,index=0,media=disk,format=raw,file=disk.iso \\\n    -device nec-usb-xhci,id=xhci \\\n    -device usb-mouse -device usb-kbd \\\n    -monitor stdio \\","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"ふう、こんな画面が見えましたか？ (Image: Hello World) まあ、ここは感動するための手続きみたいなもんなので、駄目なら駄目でさっさと次に進んでしまいましょう。 なお、僕のようにお馬鹿な人ばかりではないと思いますが、QEMUの画面でマウスをキャプチャして「抜け出せない！」などとならないようにしましょう、ダサすぎるので。Windowのタイトルに書いてありますが、Ctrl+Alt+Gで抜けられます。","category":"page"},{"location":"HorseOS/mouse/#カーネルを呼び出してみよう","page":"マウスを動かす","title":"カーネルを呼び出してみよう","text":"","category":"section"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"面倒くさいのでIPLの詳細は省きます。興味のある人はコードを読んだり他のサイトを探してください（カーネル本体書き始めるまではほんとにやるだけです）。 というわけでIPLを僕のリポジトリから引っ張って来て、魔改造してあげましょう。","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"そして、カーネルのテンプレも作りましょう（OSの名前はよく考えましょう、愛着の湧くように）。","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"$ cargo new [OSの名前] -bin","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"そして、カーネルのビルドはIPLよりひと手間増えます。僕のリポジトリからターゲットファイルを取って来て、プロジェクト直下に置いといてください。 そしてCargo.tomlを","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"[package]\nname = \"horse-kernel\"\nversion = \"0.1.0\"\nedition = \"2021\"\n\n# See more keys and their definitions at https://doc.rust-lang.org/cargo/reference/manifest.html\n\n[dependencies]\nx86_64 = \"0.14.1\"\nspin = { version = \"0.9.0\", features = [\"lock_api\", \"mutex\"] }\n\n[profile.dev]\npanic=\"abort\"","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":".cargo/config.tomlを","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"[build]\ntarget = \"x86_64-unknown-none-horsekernel.json\"\n\n[unstable]\nbuild-std = [\"core\", \"compiler_builtins\"]\nbuild-std-features = [\"compiler-builtins-mem\"]","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"こうして準備完了です。src/main.rsにカーネルの土台を書きます。","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"#![no_std]\n#![no_main]\n#![feature(abi_efiapi)]\n\n#[no_mangle]\nextern \"sysv64\" fn kernel_main(fb: *mut FrameBuffer, mi: *mut ModeInfo) -> ! {\n    loop {\n        unsafe {\n            asm!(\"hlt\")\n        }\n    }\n}","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"とりあえずCPUを休ませるだけですが、ひとつだけ説明する必要があるのは、extern \"sysv64\"ですが、Rustでプログラムを書くと、余計な情報がついてしまうようで、そのままだとIPLが上手くこの関数を呼び出せません、そこで、Cのように不要なものの内容にするために指定しています。 このあとプログラムを読めば解ると思いますが、ところどころCに合わせるために細工がされています。","category":"page"},{"location":"HorseOS/mouse/#マウスを動かそう","page":"マウスを動かす","title":"マウスを動かそう","text":"","category":"section"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"マウスを動かすまでにいろいろあるんですが、こういう技術的な解説を書こうとするとまさにMikan本のようなものすごく長いものになってしまうので、大幅カットで一気にマウスを動かすところまで行きます。 で、ちょっとこっから先はコードが長いので、GitHubからcloneしてください。","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"$ git clone https://github.com/MommaWatasu/Horse.git","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"そして、マウスを動かすためにチェックアウトします。","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"$ git checkout ba6648e","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"だいぶいろいろ追加されてますが、だいたいこんなものが追加されてます。","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"dev-tools: ビルド関係のファイル\nMakefile.toml: Cargo-makeの設定ファイル、こいつのおかげであの冗長なコマンドを打たなくて済む。入れてない人はCargo-makeを入れておきましょう。\nkernel: カーネルとその他愉快な仲間たち(usbディレクトリにUSB ホストドライバが入ってます。)","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"説明が面倒くさいのでこれ以上の説明はしませんが、なんとなく一度コードを眺めて何をしているのかぐらいは見ておいた方がいいと思います。僕も他の方のコードを眺めて大体関係性をりかいしたので。ファイル名から何やってるか察する事も多いと思いますしね。","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"さて、皆さんお待ちかねのマウス君とキーボード君の登場です。","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"$ makers RUN","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"するとあら不思議、マウスがちゃんと動き、キーボードも入力した文字が表示されるではありませんか！ Mouse and Keyboard これは感動しましたよ。こういうの見ると、開発し続けるやる気が湧いてきます。 ただ、お気づきかと思いますが、マウスが端に寄せたときに隠れないなどの不自然なところはありますが、このへんは少し面倒なので後回し。","category":"page"},{"location":"HorseOS/mouse/#おまけ","page":"マウスを動かす","title":"おまけ","text":"","category":"section"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"実機で動かしているの図、古いパソコンと古いUSBがあったらぜひやってみてください、LinuxのUSBライタでdisk.isoを書き込んで、BIOSでセキュアブートをオフにした上で起動順位さえ変えれば簡単にできます。 (Image: real-machine)","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"XHCIの設定周りのテストをしているの図、この辺はMikan本を読みながらやれるといいです。 (Image: XHCI)","category":"page"},{"location":"HorseOS/mouse/","page":"マウスを動かす","title":"マウスを動かす","text":"ビルドのビフォーアフター、僕はホストドライバをmandarinOSという他の方が書いたものから取ってきたんですが（先人は偉大）、これの写経をしていて、大量のバグが出ました。前と後のスクロールバーの大きさでわかるかと思います。。。みなさんもOS作りをするときは無理そうならコピペしましょう。 (Image: build)","category":"page"},{"location":"MachineLearning/HDBSCAN/#HDBSCANの仕組み","page":"HDBSCAN","title":"HDBSCANの仕組み","text":"","category":"section"},{"location":"MachineLearning/HDBSCAN/","page":"HDBSCAN","title":"HDBSCAN","text":"HorseMLの開発をしていて、リリースのお知らせをJuliaのDiscouseに書き込んだところ、HDBSCANやDBSCANのサポートを行う予定はありますか？との質問を受けたので、調べてみるとどうやらデータ密度からクラスを特定する手法のよう。つまり、K-meansのようにクラスタ数を最初に与えなくて良いのですが、この他にも、K-meansの拡張版であるX-meansでもBIC（ベイズ情報量）を用いてクラスタ数を決定する方法もあります。 DBSCANの実装はそう難しくなかったのですが、HDBSCANの理解・実装に時間がかかったので、備忘録として残します。","category":"page"},{"location":"MachineLearning/HDBSCAN/#HDBSCANのアルゴリズム","page":"HDBSCAN","title":"HDBSCANのアルゴリズム","text":"","category":"section"},{"location":"MachineLearning/HDBSCAN/","page":"HDBSCAN","title":"HDBSCAN","text":"ほぼ、参考文献に載せた論文の2.2.2の文章を和訳したものです。","category":"page"},{"location":"MachineLearning/HDBSCAN/#中心距離の定義","page":"HDBSCAN","title":"中心距離の定義","text":"","category":"section"},{"location":"MachineLearning/HDBSCAN/","page":"HDBSCAN","title":"HDBSCAN","text":"このアルゴリズムには、対象となるデータの他に、２つのパラメータが必要となります。 １つ目のパラメータは距離の算出に使用する最小のポイントの数kです。もう一つは、クラスタの形成に必要な最小のクラスタサイズmin_clustersです。 最初のステップはデータ同士の距離を求めることです。まず、それぞれの点について中心距離を定義します。中心距離は、「ある点からk番目に近い点からの距離」として定義されます。","category":"page"},{"location":"MachineLearning/HDBSCAN/","page":"HDBSCAN","title":"HDBSCAN","text":"この中心距離を用いて、相互到達可能距離(mutual reachability distance)と呼ばれる新しい測定基準が計算できます。相互到達可能距離は、2点それぞれの中心距離と2点間の距離（ユークリッド距離）の最大値です。","category":"page"},{"location":"MachineLearning/HDBSCAN/#最小全域木","page":"HDBSCAN","title":"最小全域木","text":"","category":"section"},{"location":"MachineLearning/HDBSCAN/","page":"HDBSCAN","title":"HDBSCAN","text":"次に、相互到達可能距離はデータ点を頂点として持ち、どの2点の間のエッジも相互到達可能距離の重みを持つグラフを作成するのに使用できます。これは計算する必要のあるグラフの最小全域木なので、アルゴリズムの人工的な概念に過ぎません。最小全域木とは全域木のエッジの重みの合計が最小になるものです。 つまり、最小全域木は閉路を持たず、エッジの重みの合計が最小となる完全なグラフに含まれるエッジによってすべてのノードが連結されたものです。結果の最小全域木はそれぞれの相互到達可能距離を重みとするループ（self-edge,loopとも呼ばれます）を各頂点に加えることで変更されます。これにより拡張最小全域木と呼ばれるものが得られます。","category":"page"},{"location":"MachineLearning/HDBSCAN/","page":"HDBSCAN","title":"HDBSCAN","text":"これで、グラフを使用してHDBSCAN階層を構築できます。 まず、クラスターラベルが1つあり、すべてのポイントがこのクラスターに割り当てられます。 このクラスターはクラスターリストに追加されます。 次に、グラフはエッジの重みで昇順で並べ替えられます。グラフの下から順に、拡張された最小スパニングツリーからエッジが繰り返し削除されます。同じ重みのエッジも同時に削除する必要があります。削除されるエッジの重み値は、現在の階層レベルを示すために使用されます。エッジが削除されると、削除されたエッジを含むクラスターが探索されます。切断され、 min_sizeより少ないポイントを含むクラスターには、すべてノイズラベルが割り当てられます。 切断されたがmin_sizeポイントを超えるクラスターには、新しいクラスターラベルが割り当てられます。 これはクラスター分割と呼ばれます。更に、新しいクラスタはクラスタのリストに追加されます。エッジの削除によるクラスタ分割が原因で新たなクラスタが生成された時に、新たな階層レベルが作られます。最終的には、データセットに含まれるすべてのデータがノイズに割り振られます。このような過程によって作られた階層がHDBSCAN階層です。HDBSCAN階層を作成する間、すべてのクラスタは保持され、それぞれの親クラスタへの参照を持っています。","category":"page"},{"location":"MachineLearning/HDBSCAN/#クラスタの識別","page":"HDBSCAN","title":"クラスタの識別","text":"","category":"section"},{"location":"MachineLearning/HDBSCAN/","page":"HDBSCAN","title":"HDBSCAN","text":"次のステップでは、HDBSCAM階層と作成されたクラスタのリストを使って特徴的なクラスタを階層の中から識別することです。これを行うには、クラスタの安定性を決定するのに使うことのできる新たな基準が確立される必要があります。これはラムダと呼ばれ、lambda = frac1edgeweightというものです。更に、クラスタにもlambda_birthとlambda_deathをそれぞれクラスタが生成された時のラムダ、そのクラスタが2つのクラスタに分割された際のラムダとして定義します。クラスタ内のそれぞれの点には、その点がクラスタから落ちた時のラムダをlambda_pとして定義できます。これで安定性をクラスタに対して計算することができます。このように表現できます。","category":"page"},{"location":"MachineLearning/HDBSCAN/","page":"HDBSCAN","title":"HDBSCAN","text":"stability = sum_p in Cluster(lambda_p - lambda_birth)","category":"page"},{"location":"MachineLearning/HDBSCAN/","page":"HDBSCAN","title":"HDBSCAN","text":"この安定性はクラスタを通して伝播される必要があります。末端のクラスタは子クラスタを持たず、クラスタのリストから識別することができます。末端のクラスタから始めてクラスタの持つ参照を用いて上の階層のクラスタへと移って行きます。末端のクラスタは常にその安定性を親クラスタに伝播するともに伝搬された子クラスたとして親クラスタに追加します。末端でないクラスタには2つのうちどちらかが起こります。もし処理中のクラスタの安定性が子クラスタの合計安定性より高い場合、その安定性だけが親クラスタへ伝えられます。その他の場合、その子クラスタの安定性の合計が親クラスタに伝えられます。自明ですが、ルートクラスタでは親クラスタへの伝播は発生しません。 処理が終わると、ルートクラスタには安定性が最も高い子クラスタへの参照が含まれています。最も高い安定性を持つクラスタは最も特徴的なクラスタです。最も特徴的なクラスタの詳細とともにHDBSCAN階層を使用すると、各データポイントのクラスタ割当が高速に生成できます。","category":"page"},{"location":"MachineLearning/HDBSCAN/#最後に","page":"HDBSCAN","title":"最後に","text":"","category":"section"},{"location":"MachineLearning/HDBSCAN/","page":"HDBSCAN","title":"HDBSCAN","text":"大分複雑なので、「ん？」となるところも結構ありますが、なんとか理解できるかなって感じです。 難しいアルゴリズムではありますが、他の手法とは段違いにノイズに強いので役に立つものだと思います（けどHorseMLに実装するのはかなり骨が折れそう…）。","category":"page"},{"location":"MachineLearning/HDBSCAN/#参考文献","page":"HDBSCAN","title":"参考文献","text":"","category":"section"},{"location":"MachineLearning/HDBSCAN/","page":"HDBSCAN","title":"HDBSCAN","text":"An Implementation of the HDBSCAN* Clustering Algorithm\nHow HDBSCAN Works","category":"page"},{"location":"#Horse-Blog","page":"Home","title":"Horse Blog","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"このブログは、MommaWatasuが備忘録的な感じで自分で書いたプログラムとかについて適当に書いてます。 使ってる言語は","category":"page"},{"location":"","page":"Home","title":"Home","text":"Julia\nRust(習得中)\nPython\nその他愉快な仲間たち（HTML等々）","category":"page"},{"location":"","page":"Home","title":"Home","text":"って感じです。 機械学習とかOS開発とかゲームプログラミングとかをやってるので、参考になれば良いです（結構OS開発なんかは日本語の情報が少ないので、奮闘してます）。 なお、JuliaのDocumenter.jl使ってる影響でドキュメント調なのは気にしない。","category":"page"},{"location":"HorseOS/#HorseOS","page":"HorseOSとは","title":"HorseOS","text":"","category":"section"},{"location":"HorseOS/","page":"HorseOSとは","title":"HorseOSとは","text":"僕は何故か最初にプログラミングに使ったマシンがLinuxだったことで、Linux信者になり。ノートパソコンにもWIndowsを消してLinux Mint入れてるんですが。 Linuxを使ってると、Windowsを使うのに比べかなりメタなところが垣間見えます。そうして何度も見ているうちに、OSを作ってみたいという気持ちが湧いてきたので、作り始めました。 それと、このOS作りを行う上で非常に参考にさせていただいているMikan本はじめ多くの先人たちはCでOSを作ってるんですが、Rustは安全で書きやすいというのをよく目にするので、ちょうど低レイヤーということで、 Rustの習得も兼ねてやってます。","category":"page"},{"location":"HorseOS/","page":"HorseOSとは","title":"HorseOSとは","text":"そんなわけでかなり数少ないRust製のOSなので、そんなに大したものではないとはいえ、参考になれば幸いです。 なお、なにかHorseOSに関して、OS作りに関して聞きたいこと等あれば、お気軽にリポジトリのissueに日本語で構わないので書いてください。","category":"page"}]
}
