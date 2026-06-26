using System;
using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using System.Net.Sockets;
using System.Reflection;
using System.Threading;
using System.Windows.Forms;

internal static class YijiaLauncher
{
    private const string BundleResourceName = "YijiaDesktopBundle.zip";
    private const string AppFolderName = "YijiaCampusSystem";
    private const string AppVersion = "0.0.2";
    private const string BackendExeName = "YijiaApp.exe";
    private const string LocalUrl = "http://127.0.0.1:8080/signin";

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

            string backendExe = Path.Combine(cacheRoot, BackendExeName);
            EnsureBundleExtracted(cacheRoot, backendExe);

            Process backend = Process.Start(new ProcessStartInfo
            {
                FileName = backendExe,
                WorkingDirectory = cacheRoot,
                UseShellExecute = false,
                CreateNoWindow = true
            });

            if (backend == null)
            {
                throw new InvalidOperationException("Unable to start the backend application.");
            }

            if (backend.WaitForExit(1500))
            {
                throw new InvalidOperationException("The backend application exited during startup.");
            }

            WaitForPort("127.0.0.1", 8080, TimeSpan.FromSeconds(90));
            OpenBrowser(LocalUrl);

            return 0;
        }
        catch (Exception ex)
        {
            MessageBox.Show(ex.ToString(), "翼家校园通信系统启动失败", MessageBoxButtons.OK, MessageBoxIcon.Error);
            return 1;
        }
    }

    private static void EnsureBundleExtracted(string cacheRoot, string backendExe)
    {
        string markerFile = Path.Combine(cacheRoot, ".ready");
        if (File.Exists(markerFile) && File.Exists(backendExe))
        {
            return;
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
                throw new InvalidOperationException("Missing embedded application bundle.");
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

                    Directory.CreateDirectory(Path.GetDirectoryName(targetPath));
                    using (Stream input = entry.Open())
                    using (FileStream output = File.Create(targetPath))
                    {
                        input.CopyTo(output);
                    }
                }
            }
        }

        File.WriteAllText(markerFile, DateTime.UtcNow.ToString("O"));
    }

    private static void WaitForPort(string host, int port, TimeSpan timeout)
    {
        DateTime deadline = DateTime.UtcNow.Add(timeout);
        while (DateTime.UtcNow < deadline)
        {
            try
            {
                using (TcpClient client = new TcpClient())
                {
                    IAsyncResult result = client.BeginConnect(host, port, null, null);
                    WaitHandle handle = result.AsyncWaitHandle;
                    if (handle.WaitOne(TimeSpan.FromSeconds(1)))
                    {
                        client.EndConnect(result);
                        return;
                    }
                }
            }
            catch
            {
                // Keep waiting until the backend is ready.
            }

            Thread.Sleep(500);
        }

        throw new TimeoutException("The backend did not become ready in time.");
    }

    private static void OpenBrowser(string url)
    {
        try
        {
            Process.Start(new ProcessStartInfo
            {
                FileName = url,
                UseShellExecute = true
            });
        }
        catch
        {
            // The app is already running. If browser launch fails, users can open it manually.
        }
    }
}

