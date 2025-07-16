import { join, basename } from "https://deno.land/std@0.224.0/path/mod.ts";
import { JSZip } from "https://deno.land/x/jszip@0.11.0/mod.ts";

/**
 * 判断Mod支持的环境
 * @param modFile - Mod文件路径
 * @returns 包含isClient和isServer的元组
 */
async function checkModEnvironment(modFile: string): Promise<[boolean, boolean]> {
  try {
    const fileData = await Deno.readFile(modFile);
    const zip = new JSZip();
    await zip.loadAsync(fileData);

    // 检查Fabric Mod
    const fabricModFile = zip.file("fabric.mod.json");
    if (fabricModFile) {
      const fabricMod = JSON.parse(await fabricModFile.async("text"));
      const environment = fabricMod.environment || "*";
      return [
        environment === "client" || environment === "*",
        environment === "server" || environment === "*"
      ];
    }

    // 检查Forge Mod (1.13+)
    const forgeModFile = zip.file("META-INF/mods.toml");
    if (forgeModFile) {
      const modsToml = await forgeModFile.async("text");
      // 简化的TOML解析 - 实际项目应使用TOML解析库
      const hasClient = modsToml.includes("client") || !modsToml.includes("sides");
      const hasServer = modsToml.includes("server") || !modsToml.includes("sides");
      return [hasClient, hasServer];
    }

    // 检查旧版Forge Mod (1.12-)
    const oldForgeFile = zip.file("mcmod.info");
    if (oldForgeFile) {
      // 旧版默认同时支持客户端和服务端
      return [true, true];
    }
  } catch (error) {
    console.error(`解析Mod失败: ${basename(modFile)}`, error);
  }
  
  // 无法识别的Mod类型
  return [false, false];
}

/**
 * 处理Mod分类
 */
async function organizeMods() {
  const tempDir = "./.temp_unzip";
  const modsDir = "./mods";
  const serverDir = "./mods_server";
  const clientDir = "./mods_client";

  // 判断 Mods 目录是否存在
  if (!await Deno.stat(modsDir).then(() => true).catch(() => false)) {
    console.error("未找到Mods目录！");
    Deno.exit(1);
  }

  // 清除原有目录
  await Deno.remove(serverDir, { recursive: true }).catch(() => {});
  await Deno.remove(clientDir, { recursive: true }).catch(() => {});
  
  // 创建目标目录
  await Deno.mkdir(serverDir, { recursive: true }).catch(() => {});
  await Deno.mkdir(clientDir, { recursive: true }).catch(() => {});
  
  // 扫描Mod目录
  let processed = 0;
  for await (const dirEntry of Deno.readDir(modsDir)) {
    if (dirEntry.isFile && dirEntry.name.endsWith(".jar")) {
      const modPath = join(modsDir, dirEntry.name);
      console.log(`✅ 处理Mod: ${dirEntry.name}`);
      
      const [isClient, isServer] = await checkModEnvironment(modPath);
      
      if (isClient) {
        const dest = join(clientDir, dirEntry.name);
        await Deno.copyFile(modPath, dest);
        console.log(`  → 🙂客户端: ${dest}`);
      }
      
      if (isServer) {
        const dest = join(serverDir, dirEntry.name);
        await Deno.copyFile(modPath, dest);
        console.log(`  → ☁️服务端: ${dest}`);
      }
      
      processed++;
      console.log(`进度: ${processed}个Mod已处理\n`);
    }
  }

  // 清理临时文件
  await Deno.remove(tempDir, { recursive: true }).catch(() => {
  });
  
  console.log(`\n完成! 共处理${processed}个Mod文件`);

  // 按下回车键退出
  console.log("⌨️ 按回车键[↩︎]退出...");
  await Deno.stdin.read(new Uint8Array(1));
}

// 主函数
async function main() {
  try {
    await organizeMods();
  } catch (error) {
    console.error("❌程序执行出错:", error);
    Deno.exit(1);
  }
}

// 执行主函数
main();