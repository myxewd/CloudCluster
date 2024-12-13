# CloudCluster

本项目实现了基于Windows系统下基本的远程操作和命令执行功能，采用易语言编写，总共由如下三个组件组成。

1. 远端客户（CloudClusterServiceCenter）
2. 服务端（sct-base）
3. 管理应用（Monster）

```mermaid
graph TD
	A[Server] -->|Task| B[ServiceCenter]
	C[Monster] -->|Task| A
    B -->|HeartBeat| A
    style A fill:#4b5cc4;
    
 
```

ServiceCenter需要通过Installer注册为系统服务以完成安装，下面介绍配置过程。

# 配置过程

## SCT-Base

作为CloudCluster的核心组件，sct-base的重要性不言而喻，其作用如下。

1. 用户鉴权
2. 数据存储
3. 反弹Shell服务端

要部署sct-base，请先安装数据库软件。鉴于暂无成熟的多数据库驱动方案，目前只支持使用mysql作为数据库程序。在安装完成后，请创建一个数据库供sct-base使用，并使用sct-server目录下的`structure.sql`初始化数据库结构。

需要注意的是，sct-base只支持通过`mysql_native_password`插件登录数据库，请提前配置数据库用户鉴权插件。

在数据库配置完成后，请打开sct-server目录下的`sct-base.e`文件，修改以下五项。

1. 常量表->KEY（修改为随机字串即可）
2. 常量表->mysql_host
3. 常量表->mysql_user
4. 常量表->mysql_passwd
5. 常量表->mysql_dbname

不建议使用root用户作为程序的数据库用户，因为本程序接口设计并未过滤特殊字符，采用拼接方式构造sql语句，具有sql注入风险。若您对安全性有要求，可在`Main->HandleFun`函数下编辑url参数字符过滤规则。

配置完成后，请编译程序，得到`sct-base.exe`。您可以使用：

```shell
sct-base.exe -port 8071
```

启动一个实例，但是建议您使用api网关对本服务做负载均衡，在`sct-server`目录下，提供了`ecosystem.config.js`文件。若您有nodejs环境，可使用pm2方便地管理本服务，监控并在程序崩溃时自动重启。

## ServiceCenter

对ServiceCenter的配置较为简单，只需打开`dllmain.e`，并修改下列项。

1. 常量表->server

修改为刚刚配置的`sct-base`服务的url即可，假如您配置的url为`http://127.0.0.1:8070/`请确保`http://127.0.0.1:8070/status`可访问并返回`ok`。

编译后得到`CCServiceCenter.dll`备用。

## Installer

此为ServiceCenter的安装器，请您打开`CloudCluster-Installer.e`并做如下一项修改。

1. 资源表->图片或图片组->module

将此内容修改为刚刚编译得到的`CCServiceCenter.dll`即可。编译Installer，得到`setup.exe`安装文件。

请确保`setup.exe`的清单中配置了“运行前请求UAC”权限，这非常重要。若没有此项，在运行`setup.exe`前，请选择“以管理员方式运行”。

## Monster

对管理应用的修改非常简单，请您打开`CloudCluster-GUI.e`，并做如下一项修改。

1. 常量表->baseURL

配置等同`ServiceCenter`的`server`。

假如您配置的baseURL为`http://127.0.0.1:8070/`请确保`http://127.0.0.1:8070/status`可访问并返回`ok`。

编译程序即可。

# 运行

## Init Admin

请你打开`sct-base.e`，调用其中的`enc_passwd`函数，传入您想设置的密码，返回值即为加密后的值。

以下为一例。

```yaml
pt: 123456
ct: c7d165d12589b53d5c3558a562812b9bff2814583f391129bf929c43f17ce0a619c23e9a4d68552f1c507646159d93fe
```

将您想设置的用户名和密文添加到数据库的`user`表中，即完成注册。

## Install

在目标计算机上运行`setup.exe`，选择`1`安装ServiceCenter，正常情况下安装程序会显示绿色字体，并提示服务已启动。

此时，启动Monster.exe并登录，您可以在主机列表中看到已经注册成功的计算机。

您可以对其执行一些命令，具体如下。

### 下载文件

```
wget
http://127.0.0.1/download.zip
a.zip
```

首行为命令名称，第二行为文件url，第三行为保存文件名。在下载完成后，您可以在主机列表的消息中看到汇报讯息。

### 执行命令

```
cmd
curl http://127.0.0.1:8070/status
del C:\Windows\TEMP\a.zip
```

执行任意dos命令，cmd下可以跟多行命令，会被依次执行。需要注意的是，执行这些命令的cmd实例并非同一个，所以上一行设置的环境变量无法被下一行的命令所读取。

## Uninstall

您可以启动`setup.exe`，并选择`2`以卸载`ServiceCenter`的全部组件，并删除服务。