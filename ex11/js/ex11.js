import { update } from "../../js_modules/update.js";

window.addEventListener(
  "load",
  function () {
    cgStart();
  },
  false
);

function cgStart() {
  // 1.レンダラー(CGの描画)オブジェクト生成
  //（復習）　newはオブジェクト生成のJavaScriptの命令
  let rendererObj = new THREE.WebGLRenderer();

  //レンダラーのプロパティ（色、サイズ）を設定
  rendererObj.setClearColor(new THREE.Color(0xaaaaaa)); //描画空間の色を設定しておく
  rendererObj.setSize(window.innerWidth, window.innerHeight); //描画空間サイズ指定 //（１）影を描画するための宣言（影を計算する準備）

  rendererObj.shadowMap.enabled = true;
  //id-cg-frameのタグをオブジェクト化し、その中に描画オブジェクト（renderer）を追加(append)
  document.getElementById("cg-frame").appendChild(rendererObj.domElement);
  //オブジェクト化されたdivタグ　そのオブジェクトの中(Child)

  // 2.シーン・オブジェクト生成：舞台を作成するイメージ
  //(3次元空間オブジェクトを生成：この中に物体を配置、描画)
  let sceneObj = new THREE.Scene();

  //（２）スポットライトを設定 NEW
  let spotColor = "#ffffff"; //光源食：文字列変数の時は0x を#にして１６進文字列に
  let spotLight = new THREE.SpotLight(spotColor); //光源種類と色
  spotLight.position.set(-20, 30, -5); //光源の位置
  spotLight.angle = Math.PI / 6;

  spotLight.castShadow = true; //物体に影を与える（cast）光源として指定（光源あっても実世界のように影ができるわけではない！）
  // 影の解像度設定
  spotLight.shadow.mapSize.width = 2048; //なくても影できるが、粗い（ピクセルのギザギザ）
  spotLight.shadow.mapSize.height = 2048; //影の解像度（２のべき乗）デフォルト５１２：
  spotLight.visible = true; //オン・オフ（複数の光源の効果を確かめる際に利用）（Falseで効果がなくなることを確認！）
  sceneObj.add(spotLight); //シーンに光源を追加

  // （３）スポットライトを小球で描画 NEW
  // ３次元空間では、物体と光源の位置関係を把握することは必要で極めて重要
  // 光源を小球面で描画して可視化すると現象が正しいか検証できる！
  // 分数数を省いているが、前回を参考に経度緯度の分割数を指定・変更して形状の滑らかさを確認せよ

  let spotPoint = new THREE.SphereGeometry(1, 0); //半径をやや大
  let spotPointMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  let spotPointDot = new THREE.Mesh(spotPoint, spotPointMat);
  spotPointDot.position.set(-20, 30, 5); //光源の位置
  spotLight.angle = Math.PI / 6;

  sceneObj.add(spotPointDot); //シーンに追加
  // ※「スポットライトを表す小球」には車道を与えないので、シャドウの設定はしない！
  // 「光源を表示する物体（ダミー）」なので、影を落とす設定などない！

  // （４）点光源を設定　NEW
  let pointColor = "#ccffcc"; //色を決める
  let pointLight = new THREE.PointLight(pointColor); //点光源の色として設定
  spotLight.position.set(-20, 30, -5); //光源の位置
  spotLight.castShadow = true; //物体に影を与える（cast）光源として指定（光源あっても実世界のように影ができるわけではない！）

  let spotHelper = new THREE.SpotLightHelper(spotLight);
  let pointHelper = new THREE.PointLightHelper(pointLight);
  sceneObj.add(spotHelper);
  sceneObj.add(pointHelper);

  // 影の解像度設定
  spotLight.shadow.mapSize.width = 2048; //なくても影できるが、粗い（ピクセルのギザギザ）
  spotLight.shadow.mapSize.height = 2048; //影の解像度（２のべき乗）デフォルト５１２：
  spotLight.visible = true; //オン・オフ（複数の光源の効果を確かめる際に利用）（Falseで効果がなくなることを確認！）
  sceneObj.add(pointLight); //シーンに光源を追加

  // （５）点光源を小球で描画
  // let spotPoint = new THREE.SphereGeometry(0, 5); //半径小
  // let spotPointMat = new THREE.MeshBasicMaterial({ color: 0xac6c25 });
  // let spotPointDot = new THREE.Mesh(pointSphere, pointSphereMat);
  // spotPointDot.position.set(10, 10, 10); //光源の位置
  // spotObj.add(spotPointDot); //シーンに追加
  // 「光源を表示する物体（ダミー）」なので、影を落とす設定などない！
  // 前回の例では、光源を設定していない。
  // 光源と物体表面での販社の計算はせず、指定した色で物体の表面を描いているだけ.
  // ・床は、塗りつぶし、球、立方体は指定職でメッシュの線を描いている

  //以後に空間に配置する物体、物体の色などをレンダリングする情報を指定していく
  // 3.0. 物体0(空間を見牛わないために、座標軸を描く)
  // 軸オブジェクト生成（チェック用）　（デフォルト）x軸：赤、y軸：緑、z軸：青
  let axesObj = new THREE.AxesHelper(50);

  // 作成したシーン（空間）に字句オブジェクトを追加
  sceneObj.add(axesObj);

  //以後、空間に描画したい物体オブジェクトを作成、空間に追加の形式となる

  //3-1.　物体１：床
  // (1)まず、形！　平面（plane)の形状(Geometry)オブジェクトを横６０、縦２０で生成
  // とにかく、形状を準備するだけで、何も起こらない！
  let planeGeo = new THREE.PlaneGeometry(50, 20);
  // (2)次に表面材質（Material）の状態！
  // 様々な指定ができるが、ここではメッシュ（格子）で区切る、基本色を指定する
  // let planeMat = new THREE.MeshBasicMaterial({ color: 0xcccccc });
  // （６）床の表面反射モデルの変更
  // ランバート反射モデル
  let planeMat = new THREE.MeshLambertMaterial({ color: 0xffffff });

  let planeObj = new THREE.Mesh(planeGeo, planeMat);
  //情報からの光源により、球、立方体による影を受ける（落とされる、キャストされる）

  // （７）影の設定
  planeObj.receiveShadow = true; //床は影を受ける（receive）
  sceneObj.add(planeObj); //シーンに追加の直前に、上の影の指定を追記

  //別々に作成した形状と表面の状態を統合して、１つのオブジェクト（平面オブジェクト）にする
  // let planeObj = new THREE.Mesh(planeGeo, planeMat); //形状、材質を統合して１つの物体にする

  // 作成した平面オブジェクトを作成しておいた空間（舞台）に配置場所を指定

  // xy平面に張り付いている平面を、床となるxy平面に寝かせる
  // x軸を中心に1 / 2π(rad)回転
  planeObj.rotation.x = 0.1111; /*0.0 試してみよ！*/ /*-0.5 * Math.Pi*/
  planeObj.rotation.y = 0.1111; /*0.0 試してみよ！*/ /*-0.5 * Math.Pi*/
  planeObj.rotation.z = 0.5; /*0.0 試してみよ！*/ /*-0.5 * Math.Pi*/

  //軸を中心とした回転を判別するために、こぶし握り、親指を座標軸正方向に合わせ、手首回転が軸の回転の正方向
  // 平面の中心座標をx,y,z個別に指定
  planeObj.position.x = 15;
  planeObj.position.y = 0;
  planeObj.position.z = 0;

  // 上記で指定した平面をシーン（舞台）に追加（配置）
  sceneObj.add(planeObj);

  // 3.2.物体２：球
  //球オブジェクト作成
  let sphereGeo = new THREE.SphereGeometry(4, 20, 20); //半径、経度分別、緯度分別
  // 表面材質設定
  // let sphereMat = new THREE.MeshBasicMaterial({
  //   color: 0x7777ff,
  //   wireframe: true,
  // });
  // （８）球の表面反射モデルの変更
  let sphereMat = new THREE.MeshLambertMaterial({ color: 0x7777ff });
  //形状と表面材質を組み合わせる
  let sphereObj = new THREE.Mesh(sphereGeo, sphereMat);
  // 配置位置（座標セットの別表記）

  // 情報からの光源により、床へ影を落とす（影をキャストする）
  sphereObj.castShadow = true;
  sceneObj.add(sphereObj);
  sphereObj.position.set(20, 4, 2); //sphereObj.position.x=20,sphereObj.position.y=4,sphereObj.position.z=2を一度に設定できる

  //シーンに追加
  sceneObj.add(sphereObj);

  // 3 - 3.物体3立体体
  let cubeGeo = new THREE.BoxGeometry(4, 4, 4);
  // let cubeMat = new THREE.MeshBasicMaterial({
  //   color: 0xff0000,
  //   wireframe: true,
  // });
  // （９）立方体の表面反射モデルの変更
  let cubeMat = new THREE.MeshLambertMaterial({ color: 0xff0000 });
  let cubeObj = new THREE.Mesh(cubeGeo, cubeMat);

  cubeObj.position.set(10, 10, 0); //(10,10,0) (x,y,z)
  cubeObj.castShadow = true;
  sceneObj.add(cubeObj);
  sceneObj.add(cubeObj);
  // 5.カメラ・オブジェクト生成（透視投影カメラ）
  let cameraObj = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  // カメラの位置、視線方向を設定
  cameraObj.position.x = -30;
  cameraObj.position.y = 40;
  cameraObj.position.z = 30;
  // cameraObj.position.set(-30, 40, 30);
  cameraObj.lookAt(sceneObj.position); //scene.positionはデフォルトで減点カメラを向ける方向を指定
  // 6.シーンとカメラをレンダラーに追加
  // rendererObj.render(sceneObj, cameraObj);
  // マウスで視点を動かす。
  // 視点を動かし、３次元から２次元の返還、反射計算させて、再描画の指示が必要

  cameraObj.position.x = -30;
  cameraObj.position.y = 40;
  cameraObj.position.z = 30;
  cameraObj.lookAt(sceneObj.position);
  let trackballControls = new THREE.TrackballControls(
    cameraObj,
    rendererObj.domElement
  );
  trackballControls.rotateSpeed = 5.0; //回転の感度：調整せよ
  trackballControls.zoomSpeed = 1.0;
  trackballControls.panSpeed = 1.0; //シーン（画像写真（シーン）をパン（平行移動）する）
  let clock = new THREE.Clock(); //時計を呼び出す

  function render() {
    let delta = clock.getDelta(); //前回呼ばれてからの経過時間を取得
    trackballControls.update(delta); //②カメラ位置を更新（経過時間を渡す仕様）
    requestAnimationFrame(render); //一定間隔で自分を呼び出す
    rendererObj.render(sceneObj, cameraObj);
  }
  render(); //最後
}
update(); //毎回必要（このファイルの1行目も）
//課題
// (1)スポットライトの角度を３０度（n/6ラジアン）で与えよ（光源位置の指定の直後）
// spotLight.angle=Math.PI/6;

// (3)軸ヘルパーと同じようにライトにも確認用ヘルパーが提供されている.
//   スポットライトヘルパー、点光源ヘルパーをシーンに追加して描画せよ
// それぞれのライトヘルパーはした（左辺の変数名は任意）
// let spotHelper = new THREE.SpotLightHelper(spotLight);
// let pointHelper = new THREE.PointLightHelper(pointLight);
// このように、光源ヘルパーは光源の位置を使って描画するので、光源よりも後に作成
