using System;
using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Reflection;
using System.Security.Cryptography;
using System.Windows.Forms;

internal static class YijiaDesktopBootstrap
{
    private const string BundleResourceName = "YijiaDesktopBundle.zip";
    private const string AppFolderName = "YijiaCampusSystemDesktop";
    private const string AppVersion = "0.0.3";
    private const string DesktopExeName = "翼家校园通信系统.exe";
    private const string BundleHashFileName = ".bundlehash";

    [STAThread]
    private static int Main()
    {
        try
        {
            string cacheRoot = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                AppFolderName,
                "cache",
                AppVersion);

            string desktopExe = Path.Combine(cacheRoot, DesktopExeName);
            EnsureBundleExtracted(cacheRoot, desktopExe);

            Process process = Process.Start(new ProcessStartInfo
            {
                FileName = desktopExe,
                WorkingDirectory = cacheRoot,
                UseShellExecute = true
            });

            if (process == null)
            {
                throw new InvalidOperationException("Unable to start the desktop application.");
            }

            return 0;
        }
        catch (Exception ex)
        {
            MessageBox.Show(ex.ToString(), "翼家校园通信系统启动失败", MessageBoxButtons.OK, MessageBoxIcon.Error);
            return 1;
        }
    }

    private static void EnsureBundleExtracted(string cacheRoot, string desktopExe)
    {
        string markerFile = Path.Combine(cacheRoot, ".ready");
        string bundleHashFile = Path.Combine(cacheRoot, BundleHashFileName);
        string embeddedHash = GetEmbeddedBundleHash();

        if (File.Exists(markerFile) && File.Exists(desktopExe) && File.Exists(bundleHashFile))
        {
            string extractedHash = File.ReadAllText(bundleHashFile).Trim();
            if (string.Equals(embeddedHash, extractedHash, StringComparison.OrdinalIgnoreCase))
            {
                return;
            }
        }

        if (Directory.Exists(cacheRoot))
        {
            Directory.Delete(cacheRoot, true);
        }

        Directory.CreateDirectory(cacheRoot);

        using (Stream resource = Assembly.GetExecutingAssembly().GetManifestResourceStream(BundleResourceName))
        {
            if (resource == null)
            {
                throw new InvalidOperationException("Missing embedded desktop bundle.");
            }

            using (ZipArchive archive = new ZipArchive(resource, ZipArchiveMode.Read))
            {
                foreach (ZipArchiveEntry entry in archive.Entries)
                {
                    string normalizedName = entry.FullName.Replace('\\', Path.DirectorySeparatorChar).Replace('/', Path.DirectorySeparatorChar);
                    string targetPath = Path.Combine(cacheRoot, normalizedName);

                    if (string.IsNullOrEmpty(entry.Name))
                    {
                        Directory.CreateDirectory(targetPath);
                        continue;
                    }

                    string directory = Path.GetDirectoryName(targetPath);
                    if (!string.IsNullOrEmpty(directory))
                    {
                        Directory.CreateDirectory(directory);
                    }

                    using (Stream input = entry.Open())
                    using (FileStream output = File.Create(targetPath))
                    {
                        input.CopyTo(output);
                    }
                }
            }
        }

        File.WriteAllText(markerFile, DateTime.UtcNow.ToString("O"));
        File.WriteAllText(bundleHashFile, embeddedHash);
    }

    private static string GetEmbeddedBundleHash()
    {
        using (Stream resource = Assembly.GetExecutingAssembly().GetManifestResourceStream(BundleResourceName))
        {
            if (resource == null)
            {
                throw new InvalidOperationException("Missing embedded desktop bundle.");
            }

            using (SHA256 sha256 = SHA256.Create())
            {
                return string.Concat(sha256.ComputeHash(resource).Select(b => b.ToString("x2")));
            }
        }
    }
}

