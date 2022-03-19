# FreeCraft作成一回目(2022/3/17)

## 準備
まずは使う言語を決めることになるわけなんですが、まあ、ゲームなのでコンパイル言語のほうがいいだろうということで、Rustにしました（基本的にC系は好きじゃないので、勉強してないので）。
そんで、Rustには3D描画できるライブラリというのはPiston、Amethyst、RG3Dと言った選択肢があるんですが、PistonはDocsがよくわからず、Amethsyはバグがあるのに、レポジトリが「InActivity Mainteined」となっていて、ダメそう。ということでRG3Dを使って作っていきます。

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
fyrox = "0.24.0"
```
そしてとりあえず`cargo build`するわけなんですが、多分一発では通りません（通ったら運が良いと思います）。

まずはここで出るコンパイルエラー達をさばきましょう(申し訳ないんですが、ここはあんまり記録撮ってないので記憶で書きます)。

### alsaに関するエラー
筆者はこれでまず一回コンパイルが止まったんですがalsaなるパッケージがないよ、みたいなエラーで止まる症状が出ることがあります。
これは冷静にalsaをaptで入れてやりましょう。

### error: linking with cc failed: exit code: 1
こいつはなんか大量のエラーが図れるので気が滅入りますが、こういうとてつもないエラーは最後が肝心。
1つ目のnoteを無視して、2つ目のnoteを見てみると`cannot find ~`みたいに書いてあると思います。この`~`の部分の頭は代替`l`で始まってるんですが、この`l`のあとを`apt list | grep ~`して、`dev`ってついてる物を見つけてインストールしてやりましょう。

多分ここまででRG3Dのコンパイルが通るとこまでは行ったと思います。次はとりあえず3D描画します。

## Hello World
じゃあRG3Dの使い方を説明しよう！ってことになるんですが、結構コードが長くてコードとともに解説するのは難しいので、大体の説明は[公式チュートリアル](https://fyrox-book.github.io/fyrox/tutorials/fps/tutorial-1/tutorial-part-1.html)を見てもらうことにして、補足的な説明をします。

### ブロックを表示したい
ブロックを表示するのには、このチュートリアルで紹介されている3Dモデルを作成して使う方法は不便です。
チュートリアルに書いてある方法でいう「手続き型のメッシュ」を作成します（3Dモデルはプログラム上で指定するものを静的にファイルに記述していることになる）。
ただし、注意点があります。チュートリアル通りにメッシュを作成しただけではブロックを自分が透過してしまいます。これを解決するには、ブロックのメッシュに`Collider`と呼ばれるものを設定する必要があります。これにより、メッシュに当たり判定が作られ、近づくと、カメラの`Collider`とぶつかって透過しなくなります。
また、マイクラでは重力に従うブロックと従わないブロックがありますが、`RigidBody`にはデフォルトで重力などが働くため、外部からの力によって動かないように`RigidBodyType`として`Static`を指定してやる必要があります。

ここまでの内容を考慮して、以下のような関数を作りました。
```
fn create_procedural_mesh(
    scene: &mut Scene,
    resource_manager: &ResourceManager,
    position: (f32, f32, f32)
) -> Handle<Node> {
    let mut material = Material::standard();

    // Material is completely optional, but here we'll demonstrate that it is possible to
    // create procedural meshes with any material you want.
    material
        .set_property(
            &ImmutableString::new("diffuseTexture"),
            PropertyValue::Sampler {
                value: Some(resource_manager.request_texture("assets/dirt.png")),
                fallback: SamplerFallback::White,
            },
        )
        .unwrap();
    
    RigidBodyBuilder::new(
        BaseBuilder::new()
            .with_local_transform(
                TransformBuilder::new()
                    // Offset player a bit.
                    .with_local_position(Vector3::new(position.0, position.1, position.2))
                    .build(),
            )
            .with_children(&[
                {
                    MeshBuilder::new(
                        BaseBuilder::new().with_local_transform(
                            TransformBuilder::new()
                                .with_local_position(Vector3::new(0.0, 0.0, 0.0))
                                .build(),
                        ),
                    )
                    .with_surfaces(vec![SurfaceBuilder::new(Arc::new(Mutex::new(
                        // Our procedural mesh will have a form of squashed cube.
                        // A mesh can have unlimited amount of surfaces.
                        SurfaceData::make_cube(Matrix4::new_nonuniform_scaling(&Vector3::new(
                            0.5, 0.5, 0.5
                        ))),
                    )))
                        .with_material(Arc::new(Mutex::new(material)))
                        .build()])
                    .build(&mut scene.graph)
                },
                // Add capsule collider for the rigid body.
                ColliderBuilder::new(BaseBuilder::new())
                    .with_shape(ColliderShape::cuboid(0.25, 0.25, 0.25))
                    .build(&mut scene.graph),
            ]),
    )
    // We don't want the player to tilt.
    .with_locked_rotations(true)
    // We don't want the rigid body to sleep (be excluded from simulation)
    .with_can_sleep(false)
    // We don't want the block to move
    .with_body_type(RigidBodyType::Static)
    .build(&mut scene.graph)
}
```
この関数は`position`にx座標、y座標、z座標のタプルを渡すと、指定した座標に土ブロックを表示してくれます。

### テクスチャの修正
先程のコードでブロックの描画自体はできるんですが、元画像が16ピクセルなので、テクスチャがぼやけます。では、ぼやけるのを治すのにはどうしたらいいかというと、テクスチャを読み込む際のオプションを`*.png.option`にかけるので、ここで修正するように設定しておきます。
このようにしてください
```
(
    minification_filter: Nearest,
    magnification_filter: Nearest,
    s_wrap_mode: Repeat,
    t_wrap_mode: ClampToEdge,
    anisotropy: 8.0,
    compression: NoCompression,    
)
```
このうち、
```
minification_filter: Nearest,
magnification_filter: Nearest,
```
が重要です。これによりテクスチャを読み込むときに勝手に修正してくれます。

## 最後に
今回はどうやってブロックを描画するのかまでを書きました。次回は今ある当たり判定の不自然さを直して、ブロックをバリエーションを増やしてそれっぽくしていこうと思います。