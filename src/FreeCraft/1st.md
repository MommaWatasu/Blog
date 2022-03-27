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
ブロックを表示するのには、手続き型（プログラムで記述する）方法と3Dモデルをロードする方法があります。最初は手続き型の方が何かと便利だと思っていたのですが、やってみると各面に異なるテクスチャを貼ることができないようなんです。あと、3Dモデルの方が何かと編集するのとかが便利なので、3Dモデルを予めBlenderで作っておいて、それをロードするようにします。
ここで注意点があります、チュートリアル通りにメッシュを作成しただけではブロックを自分が透過してしまいます。これを解決するには、ブロックのメッシュに`Collider`と呼ばれるものを設定する必要があります。これにより、メッシュに当たり判定が作られ、近づくと、カメラの`Collider`とぶつかって透過しなくなります。
また、マイクラでは重力に従うブロックと従わないブロックがありますが、`RigidBody`にはデフォルトで重力などが働くため、外部からの力によって動かないように`RigidBodyType`として`Static`を指定してやる必要があります。

ここまでの内容を考慮して、以下のような関数を作りました。
```
async fn load_model_to_scene(
    scene: &mut Scene,
    path: &str,
    resource_manager: &ResourceManager,
    position: (f32, f32, f32)
) -> Handle<Node> {
    // Request model resource and block until it loading. 
    let model_resource =
        resource_manager.request_model(Path::new(&path))
            .await
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
                // Create an instance of the resource in the scene. 
                model_resource.instantiate_geometry(scene),
                // Add capsule collider for the rigid body.
                ColliderBuilder::new(BaseBuilder::new())
                    .with_shape(ColliderShape::cuboid(0.25, 0.25, 0.25))
                    .build(&mut scene.graph)
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