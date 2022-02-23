# FreeCraft作成一回目(2022/2/22)

## 準備
まずは使う言語を決めることになるわけなんですが、まあ、ゲームなのでコンパイル言語のほうがいいだろうということで、Rustにしました（基本的にC系は好きじゃないので、勉強してないので）。
そんで、Rustには3D描画できるライブラリというのは結構あるんですが、ゲームエンジンの中で使えるものはPistonとAmethystに絞られます。Pistonは調べてみたんですが、あまり3D描画に関するDocsが見つからなかったので、Amethystでやることにしました。それでもなかなか情報を探すのに苦労するので、参考になればと思います。

## とりあえずプロジェクトを作成
とりあえずCargoでプロジェクトを作ります。
```
$ cargo new FreeCraft --bin
```
そんで、Cargo.tomlを書いておきます。
```
[package]
name = "freecraft"
version = "0.1.0"
edition = "2021"

# See more keys and their definitions at https://doc.rust-lang.org/cargo/reference/manifest.html

[dependencies]
amethyst = {version="0.15.0", features=["vulkan"]}
```
そしてとりあえず`cargo build`するわけなんですが、多分一発では通りません（通ったら運が良いと思います）。

まずはここで出るコンパイルエラー達をさばきましょう(申し訳ないんですが、ここはあんまり記録撮ってないので記憶で書きます)。

### alsaに関するエラー
筆者はこれでまず一回コンパイルが止まったんですがalsaなるパッケージがないよ、みたいなエラーで止まる症状が出ることがあります。
これは冷静にalsaをaptで入れてやりましょう。

### error: linking with cc failed: exit code: 1
こいつはなんか大量のエラーが図れるので気が滅入りますが、こういうとてつもないエラーは最後が肝心。
1つ目のnoteを無視して、2つ目のnoteを見てみると`cannot find ~`みたいに書いてあると思います。この`~`の部分の頭は代替`l`で始まってるんですが、この`l`のあとを`apt list | grep ~`して、`dev`ってついてる物を見つけてインストールしてやりましょう。

多分ここまででAmethystのコンパイルが通るとこまでは行ったと思います。次はとりあえず3D描画します。

## Cubeの表示
Minecraftの基礎であるCubeを表示してみましょう。ここで、`Amethyst 3D Example`とかって調べるんですが、公式レポにあるExampleは説明なしのコードだけでよくわかりません。
なので、とりあえずここにコード置いて置きます。これはスケルトンなので呪文だと思っておきましょう。
```
use amethyst::{
    assets::{AssetLoaderSystemData},
    core::{Transform, TransformBundle},
    renderer::{
        plugins::{
            RenderPbr3D,
            RenderToWindow
        },
        rendy::{
            mesh::{Normal, Position, Tangent, TexCoord},
        },
        light::{Light, PointLight},
        palette::rgb::Rgb,
        shape::Shape,
        types::DefaultBackend,
        Camera,
        Material,
        MaterialDefaults,
        Mesh,
        RenderingBundle
    },
    prelude::{
        Builder,
        World,
        WorldExt
    },
    utils::application_root_dir,
    Application,
    GameData,
    GameDataBuilder,
    SimpleState,
    StateData
};

struct FreeCraft;
impl SimpleState for FreeCraft {
    fn on_start(&mut self, state_data: StateData<'_, GameData<'_, '_>>) {
        initialize_camera(state_data.world);
        initialize_cube(state_data.world);
        initialize_light(state_data.world);
    }
}

fn main() -> amethyst::Result<()> {
    // Logger
    amethyst::start_logger(Default::default());

    // assets directry
    let app_root = application_root_dir()?;
    let assets_dir = app_root.join("assets");
    
    // GameDataBuilder
    let display_config_path = app_root.join("config/display.ron");
    let game_data = GameDataBuilder::default()
        .with_bundle(TransformBundle::new())?
        .with_bundle(
            RenderingBundle::<DefaultBackend>::new()
                .with_plugin(
                    RenderToWindow::from_config_path(display_config_path)?
                        .with_clear([0.529, 0.808, 0.98, 1.0]),
                )
                .with_plugin(RenderPbr3D::default()),
        )?;
    
    let mut game = Application::new(assets_dir, FreeCraft, game_data)?;
    game.run();
    
    Ok(())
}

fn initialize_camera(world: &mut World) {
    let mut transform = Transform::default();
    transform.set_translation_xyz(0.0, 0.0, 10.0);
    world.create_entity()
        .with(Camera::standard_3d(1024.0, 768.0))
        .with(transform)
        .build();
}

fn initialize_cube(world: &mut World) {
    let mesh = world.exec(|loader: AssetLoaderSystemData<'_, Mesh>| {
        loader.load_from_data(
            Shape::Cube
                .generate::<(Vec<Position>, Vec<Normal>, Vec<Tangent>, Vec<TexCoord>)>(None)
                .into(),
            (),
        )
    });

    let material_defaults = world.read_resource::<MaterialDefaults>().0.clone();
    let material = world.exec(|loader: AssetLoaderSystemData<'_, Material>| {
        loader.load_from_data(
                Material {
                    ..material_defaults
                },
                (),
            )
        },
    );
    
    let mut transform = Transform::default();
    transform.set_translation_xyz(0.0, 0.0, 0.0);

    world.create_entity()
        .with(mesh)
        .with(material)
        .with(transform)
        .build();
}

fn initialize_light(world: &mut World) {
    let light: Light = PointLight {
        intensity: 10.0,
        color: Rgb::new(1.0, 1.0, 1.0),
        ..PointLight::default()
    }.into();

    let mut transform = Transform::default();
    transform.set_translation_xyz(5.0, 5.0, 20.0);

    world
        .create_entity()
        .with(light)
        .with(transform)
        .build();
}
```
結構長いですが、こいつを`cargo run`すれば光があたった立方体がそれっぽい背景色と共に表示されるはずです。