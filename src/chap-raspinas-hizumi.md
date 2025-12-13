---
lang: 'ja'
class: chapter
---

# ラズパイで激安NASを作る

<div class="flush-right">
遠藤ヒズミ
</div>


## 挨拶
こんにちわこんばんわおはようございます。遠藤ヒズミです。

みなさん、データマネジメントに大事な物は何か。知っています？
フォルダ分け、タグでの管理、色々ありますね。
でも、データマネジメントナンバーワンは、違います。
ストレージです。ストレージ。箱。データを入れる箱です。
いくら、管理方法を学んでも、箱がないと、意味がありません。
え？箱もないのに、管理方法を学ぶ奴はいない？

................この記事では、複雑なソフトウェアを使わず、**基本的なLinuxコマンドとSamba**を使ってNASの仕組みを理解しながら構築していこうとおもいます。
せっかく、こうして、本を買っていただいたのに、高価なNAS買いましょう！とか情報商材もいいところですよ。

### 免責事項

（ここに、お決まりの文章を書く）

## NASの必要性

さて、何故、NASなのでしょうか？
バックアップなら、クラウドストレージで十分...分かります。
クラウドストレージのデータセンターから、急にデータが消えて無くなる確率より、あなたがキーボードにコーヒーをぶっかける確率の方が高いでしょう。

理由は簡単、BANされて、データを喪失する事を防ぐことです。
分かります。あなたがNASを壊す確率の方が、データセンターにメテオフォールが降ってくる確率の何百倍も高いことを。
しかし、クラウドストレージの規約違反によるBANによるデータの喪失リスクを避けるためです。
規約違反とかしないってーｗとか言っていますが、Googleは過去に、家族の思い出写真を規約違反とAIが判断して、BANしています。
自動アップロードなので、お子さんのプールで遊んでいる写真取っただけで児童ポルノでBANです。（これが、自動ポルノってか）
Googleフォトだけではなく、Gmailをはじめとするすべてのサービスが使えなくなります。（あなたが配信者だった場合、Youtubeからチャンネルごと動画消えます。）

他にも、同人誌を入れていたら、BANされてたという話もあります（いや、エロ本をクラウドに置くなよ。）
BAN回避と言いましたが、Googleはあなたのファイルを見ています。プライベートはGoogleに筒抜けです。（見てるのはAIだけど）
MicrosoftのOneDriveにも似たような規約がありますね（勝手に入れてくるくせにね？）
10の6乗歩ゆずって、文書や絵はいいでしょう。また、書けばいいから。
写真は取り戻せません。旅行の写真をアップロードして、これまでの思い出すべてが消えてしまうのは、リスクが大きすぎます。

なので、自宅でも、データの保管庫を作りましょう。
ついでに、NASの仕組みを知って、勉強しましょう。

### なぜ基礎から学ぶのか？

- **仕組みの理解**: NASがどのように動作するかを深く理解できる
- **トラブルシューティング能力**: 問題が発生した時に原因を特定しやすい
- **応用力の向上**: 将来的により高度なシステムを構築する基礎になる
- **コスト効率**: 追加ソフトウェア不要で最小構成から始められる

ここまで、読んで、めんどくさいと思った方は、◯ドバシかビッ◯カメラへ、Goです。
お金はいいぞ...◯ナキン、大抵のことは、解決してくれる。
え？もったない？
えぇーっ？！それは、努力もせずお金も使わずに、楽したいってことかい？
じゃあ、なんでこの章読んでるの？

## 必要な機材

さて、ここまで読者を篩にかけてもなお残ってる変態の皆さんに、材料のご紹介です。（読者をふるいにかけるのは気持ちいいZOY！！）

ここまで読んでいる皆さんなら、お部屋に転がっているものばかりでしょう？？？
つまり、追加投資なしです、実質タダです！

### ハードウェア

- **Raspberry Pi 4 or 5**（4GB以上推奨）
- **microSDカード**（32GB以上、Class 10）
- **USB 3.0外付けHDD/SSD**（1TB以上推奨）
- **電源アダプター**（公式推奨）
- **LANケーブル**（安定した転送速度のため）

## 事前準備

### Raspberry Pi OSのセットアップ

**Raspberry Pi Imagerでの設定:**

- ホスト名: `pi-nas`
- SSH有効化
- Wi-Fi設定（後で有線LANに切り替え）
- ユーザー名とパスワード設定

### 初期設定とアップデート

```bash
# SSH接続後、最初にシステムをアップデート
sudo apt update && sudo apt upgrade -y

# 必要なパッケージをインストール
sudo apt install vim curl wget htop -y
```

## NASの基礎構築手順

### Step 1: 外付けストレージの準備

#### ストレージデバイスの確認

```bash
# 接続されているストレージデバイスを確認
lsblk

# 出力例:
# NAME        MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
# sda           8:0    0  1.8T  0 disk 
# mmcblk0     179:0    0   30G  0 disk 
# ├─mmcblk0p1 179:1    0  256M  0 part /boot
# └─mmcblk0p2 179:2    0 29.8G  0 part /
```

#### パーティション作成とフォーマット

```bash
# 外付けHDD（通常は/dev/sda）をフォーマット
sudo fdisk /dev/sda

# fdiskでの操作手順:
# 1. 'n' - 新しいパーティション作成
# 2. 'p' - プライマリパーティション
# 3. Enter × 3回（デフォルト値使用）
# 4. 'w' - 変更を保存

# ext4ファイルシステムでフォーマット
sudo mkfs.ext4 /dev/sda1

# ラベルを付けて管理しやすくする
sudo e2label /dev/sda1 "NAS-Storage"
```

#### マウントポイントの作成と設定

```bash
# マウントポイントの作成
sudo mkdir /mnt/nas-storage

# 一時的にマウント
sudo mount /dev/sda1 /mnt/nas-storage

# 自動マウントの設定（再起動後も有効）
# UUIDを確認
sudo blkid /dev/sda1

# /etc/fstabに追記（UUIDを使用）
echo 'UUID=your-uuid-here /mnt/nas-storage ext4 defaults,nofail 0 2' | sudo tee -a /etc/fstab

# 設定テスト
sudo umount /mnt/nas-storage
sudo mount -a
```

### Step 2: ディレクトリ構造の作成

```bash
# NAS用のディレクトリ構造を作成
sudo mkdir -p /mnt/nas-storage/{shared,users,backup,media}
sudo mkdir -p /mnt/nas-storage/users/{user1,user2}

# 権限設定
sudo chown -R pi:pi /mnt/nas-storage/shared
sudo chown -R pi:pi /mnt/nas-storage/media
sudo chmod -R 755 /mnt/nas-storage/shared
sudo chmod -R 755 /mnt/nas-storage/media

# ディレクトリ構造を確認
tree /mnt/nas-storage -L 2
```

### Step 3: Sambaサーバーのインストールと基本設定

#### Sambaのインストール

```bash
# Sambaサーバーをインストール
sudo apt install samba samba-common-bin -y

# インストール確認
samba --version
```

#### 基本的なSamba設定

```bash
# 設定ファイルのバックアップ
sudo cp /etc/samba/smb.conf /etc/samba/smb.conf.backup

# 設定ファイルを編集
sudo nano /etc/samba/smb.conf
```

**基本設定ファイル（/etc/samba/smb.conf）:**

```ini
[global]
   # サーバー基本設定
   workgroup = WORKGROUP
   server string = Raspberry Pi NAS
   netbios name = PI-NAS
   
   # セキュリティ設定
   security = user
   map to guest = bad user
   dns proxy = no
   
   # パフォーマンス設定
   socket options = TCP_NODELAY IPTOS_LOWDELAY SO_RCVBUF=262142 SO_SNDBUF=262142
   read raw = yes
   write raw = yes
   max xmit = 65536
   dead time = 15
   getwd cache = yes

# 共有フォルダの設定
[shared]
   comment = Shared Storage
   path = /mnt/nas-storage/shared
   browseable = yes
   writable = yes
   guest ok = no
   create mask = 0664
   directory mask = 0775
   valid users = pi

[media]
   comment = Media Files
   path = /mnt/nas-storage/media
   browseable = yes
   writable = yes
   guest ok = no
   create mask = 0664
   directory mask = 0775
   valid users = pi
```

### Step 4: ユーザー管理とアクセス制御

#### Sambaユーザーの作成

```bash
# 現在のLinuxユーザーをSambaユーザーとして追加
sudo smbpasswd -a pi

# パスワードを設定（プロンプトで入力）
# New SMB password: [password]
# Retype new SMB password: [password]

# ユーザーを有効化
sudo smbpasswd -e pi
```

#### 新規ユーザーの追加（オプション）

```bash
# システムユーザーを作成（シェルアクセスなし）
sudo useradd -M -s /usr/sbin/nologin nasuser1

# Sambaユーザーとして追加
sudo smbpasswd -a nasuser1
sudo smbpasswd -e nasuser1

# 専用ディレクトリの権限設定
sudo chown nasuser1:nasuser1 /mnt/nas-storage/users/user1
```

### Step 5: サービスの開始と確認

```bash
# Sambaサービスを開始・有効化
sudo systemctl start smbd
sudo systemctl start nmbd
sudo systemctl enable smbd
sudo systemctl enable nmbd

# サービス状態確認
sudo systemctl status smbd
sudo systemctl status nmbd

# Samba設定の構文チェック
testparm
```

## 動作確認

### ネットワークからの接続テスト

#### Windows PCから接続

```
1. エクスプローラーを開く
2. アドレスバーに \\pi-nas または \\IPアドレス を入力
3. ユーザー名: pi、パスワード: 設定したパスワード
```

#### Mac/Linuxから接続

```bash
# コマンドラインから
smbclient -L //pi-nas -U pi

# GUIから（Mac）
# Finder → 移動 → サーバーに接続 → smb://pi-nas
```

#### 転送速度テスト

```bash
# 大きなファイルで転送速度をテスト
dd if=/dev/zero of=/mnt/nas-storage/shared/testfile bs=1M count=100

# 実際の転送速度測定
time cp /path/to/large/file /mnt/nas-storage/shared/
```

## セキュリティ強化

### 基本的なセキュリティ設定

#### ファイアウォール設定

```bash
# UFWファイアウォールをインストール・設定
sudo apt install ufw -y

# 基本ルール
sudo ufw default deny incoming
sudo ufw default allow outgoing

# 必要なポートを開放
sudo ufw allow ssh
sudo ufw allow samba

# ファイアウォール有効化
sudo ufw enable

# 状態確認
sudo ufw status
```

#### SSH接続の強化

```bash
# SSH設定を編集
sudo nano /etc/ssh/sshd_config

# 推奨設定:
# Port 2222                     # デフォルトポート変更
# PermitRootLogin no            # root直接ログイン無効
# PasswordAuthentication yes    # 学習段階では有効
# AllowUsers pi                 # 特定ユーザーのみ許可
```

### 権限とアクセス制御

#### 細かい権限設定

```bash
# 読み取り専用共有の作成
sudo mkdir /mnt/nas-storage/readonly
sudo chmod 755 /mnt/nas-storage/readonly
sudo chown root:root /mnt/nas-storage/readonly
```

**読み取り専用共有の設定:**

```ini
[readonly]
   comment = Read Only Files
   path = /mnt/nas-storage/readonly
   browseable = yes
   writable = no
   guest ok = yes
   create mask = 0644
   directory mask = 0755
```

## トラブルシューティング

### よくある問題と解決法

#### 接続できない場合

```bash
# サービス状態確認
sudo systemctl status smbd nmbd

# ファイアウォール確認
sudo ufw status

# ネットワーク接続確認
ping pi-nas
```

#### 転送速度が遅い場合

```bash
# USB接続確認（USB 3.0接続されているか）
lsusb -t

# ディスク性能テスト
sudo hdparm -tT /dev/sda1

# ネットワーク速度テスト
iperf3 -s  # NAS側
iperf3 -c pi-nas  # クライアント側
```

#### 権限エラーの場合

```bash
# ディレクトリ権限確認
ls -la /mnt/nas-storage/

# SELinuxが有効な場合（通常は無効）
getenforce

# ファイル作成テスト
touch /mnt/nas-storage/shared/test.txt
```

#### ログの確認方法

```bash
# Sambaログ
sudo tail -f /var/log/samba/log.smbd

# システムログ
sudo journalctl -u smbd -f

# 接続状況確認
sudo smbstatus
```

## 性能最適化のヒント

### システム設定の調整

```bash
# /boot/config.txtに追記（再起動後有効）
echo 'dtparam=sd_overclock=100' | sudo tee -a /boot/config.txt
echo 'gpu_mem=16' | sudo tee -a /boot/config.txt  # GUI不使用時
```

### ファイルシステム最適化

```bash
# ext4ファイルシステムの最適化
sudo tune2fs -o journal_data_writeback /dev/sda1
echo '/dev/sda1 /mnt/nas-storage ext4 defaults,noatime,nodiratime 0 2' | sudo tee -a /etc/fstab
```

### ネットワーク最適化

```bash
# ネットワークバッファサイズ調整
echo 'net.core.rmem_max = 16777216' | sudo tee -a /etc/sysctl.conf
echo 'net.core.wmem_max = 16777216' | sudo tee -a /etc/sysctl.conf
```

## 次のステップ

この基礎構築をマスターしたら、以下の応用技術に挑戦してみましょう：

1. **RAID設定**: 複数ドライブでデータ冗長化
2. **リモートアクセス**: VPN経由での外部接続
3. **自動バックアップ**: rsyncやcronを使った定期バックアップ
4. **メディアサーバー**: Plexやjellyfin統合
5. **Docker統合**: コンテナ化アプリケーション
6. **監視システム**: Grafana + InfluxDBでの性能監視
7. RaspberryPiをUSBストレージとして、外付けHDD化

## まとめ

この記事では、Raspberry Piを使って基礎からNASを構築する方法を学びました。複雑なソフトウェアを使わずに、Linuxの基本的なコマンドとSambaを使うことで：

- **NASの動作原理**を理解できた
- **権限管理とセキュリティ**の基礎を学んだ
- **トラブルシューティング能力**を向上させた
- **将来の応用**に向けた土台を築いた

重要なのは、各手順でなぜそのコマンドが必要なのかを理解しながら進めることです。この基礎知識があれば、より高度なNASシステムも理解しやすくなります。

**学習のポイント:**

- 一つ一つのコマンドの意味を理解する
- エラーが発生したら原因を調べる習慣をつける
- 設定ファイルの構造を理解する
- セキュリティを常に意識する

これで基礎的なNAS構築は完了です。実際に使いながら、徐々に機能を拡張していきましょう。

ただ、ガチで管理したいなら、市販のNAS買ったほうがいいよ？RAID０ついてるし、機能も豊富だし。
