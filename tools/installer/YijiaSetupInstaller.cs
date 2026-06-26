using System;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Windows.Forms;

internal static class YijiaSetupInstaller
{
    private const string EmbeddedExeResourceName = "翼家校园通信系统.exe";
    private const string AppName = "翼家校园通信系统";
    private const string AppFolderName = "YijiaCampusSystem";
    private const string DesktopExeName = "翼家校园通信系统.exe";
    private const string ConfigFileName = "install-info.txt";

    [STAThread]
    private static int Main()
    {
        Application.EnableVisualStyles();
        Application.SetCompatibleTextRenderingDefault(false);

        try
        {
            using (var form = new InstallerForm())
            {
                Application.Run(form);
                return 0;
            }
        }
        catch (Exception ex)
        {
            MessageBox.Show(ex.ToString(), "翼家校园通信系统安装失败", MessageBoxButtons.OK, MessageBoxIcon.Error);
            return 1;
        }
    }

    private sealed class InstallerForm : Form
    {
        private readonly Label titleLabel;
        private readonly Label bodyLabel;
        private readonly ProgressBar progressBar;
        private readonly Button nextButton;
        private readonly Button backButton;
        private readonly Button cancelButton;
        private readonly NativeImageBox logoBox;
        private int pageIndex;
        private bool isInstalling;

        public InstallerForm()
        {
            Text = AppName + " 安装向导";
            Width = 760;
            Height = 460;
            StartPosition = FormStartPosition.CenterScreen;
            FormBorderStyle = FormBorderStyle.FixedDialog;
            MaximizeBox = false;
            MinimizeBox = false;
            ShowInTaskbar = true;
            Icon = ExtractEmbeddedIcon();

            var header = new Panel { Dock = DockStyle.Top, Height = 84, BackColor = System.Drawing.Color.FromArgb(244, 248, 255) };
            logoBox = new NativeImageBox
            {
                Left = 24,
                Top = 14,
                Width = 56,
                Height = 56
            };
            logoBox.LoadImage(GetResourceStream("assets/yijia-app-icon.png"));

            titleLabel = new Label
            {
                Left = 96,
                Top = 18,
                Width = 580,
                Height = 26,
                Font = new System.Drawing.Font("Microsoft YaHei UI", 14f, System.Drawing.FontStyle.Bold),
                ForeColor = System.Drawing.Color.FromArgb(18, 35, 63)
            };

            bodyLabel = new Label
            {
                Left = 96,
                Top = 46,
                Width = 600,
                Height = 24,
                Font = new System.Drawing.Font("Microsoft YaHei UI", 10f),
                ForeColor = System.Drawing.Color.FromArgb(91, 112, 147)
            };

            header.Controls.Add(logoBox);
            header.Controls.Add(titleLabel);
            header.Controls.Add(bodyLabel);
            Controls.Add(header);

            var footer = new Panel { Dock = DockStyle.Bottom, Height = 60, BackColor = System.Drawing.Color.WhiteSmoke };
            backButton = new Button { Text = "上一步", Width = 88, Height = 30, Left = 420, Top = 15 };
            nextButton = new Button { Text = "下一步", Width = 88, Height = 30, Left = 520, Top = 15 };
            cancelButton = new Button { Text = "取消", Width = 88, Height = 30, Left = 620, Top = 15 };
            progressBar = new ProgressBar { Left = 24, Top = 18, Width = 360, Height = 18, Visible = false, Style = ProgressBarStyle.Marquee };

            backButton.Click += (_, __) => GoBack();
            nextButton.Click += async (_, __) => await GoNextAsync();
            cancelButton.Click += (_, __) => Close();

            footer.Controls.Add(progressBar);
            footer.Controls.Add(backButton);
            footer.Controls.Add(nextButton);
            footer.Controls.Add(cancelButton);
            Controls.Add(footer);

            SetPage(0);
        }

        private void SetPage(int index)
        {
            pageIndex = index;

            if (pageIndex <= 0)
            {
                titleLabel.Text = "欢迎使用翼家校园通信系统";
                bodyLabel.Text = "该向导将把翼家校园通信系统安装到你的电脑上，并创建桌面与开始菜单快捷方式。";
                backButton.Enabled = false;
                nextButton.Text = "下一步";
                progressBar.Visible = false;
            }
            else if (pageIndex == 1)
            {
                titleLabel.Text = "准备安装";
                bodyLabel.Text = "点击下一步后，程序将开始解压并配置运行环境。";
                backButton.Enabled = true;
                nextButton.Text = "安装";
                progressBar.Visible = false;
            }
            else
            {
                titleLabel.Text = "正在安装";
                bodyLabel.Text = "请稍候，正在完成安装。";
                backButton.Enabled = false;
                nextButton.Enabled = false;
                progressBar.Visible = true;
            }
        }

        private void GoBack()
        {
            if (isInstalling || pageIndex <= 0)
            {
                return;
            }

            SetPage(pageIndex - 1);
        }

        private async System.Threading.Tasks.Task GoNextAsync()
        {
            if (isInstalling)
            {
                return;
            }

            if (pageIndex == 0)
            {
                SetPage(1);
                return;
            }

            if (pageIndex == 1)
            {
                isInstalling = true;
                SetPage(2);
                await System.Threading.Tasks.Task.Run(() => Install());
                isInstalling = false;
                MessageBox.Show("安装完成。现在可以从桌面打开翼家校园通信系统。", AppName, MessageBoxButtons.OK, MessageBoxIcon.Information);
                Close();
            }
        }

        private void Install()
        {
            string installRoot = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                AppFolderName);
            string appDir = Path.Combine(installRoot, "app", "0.0.3");
            string desktopExePath = Path.Combine(appDir, DesktopExeName);

            if (Directory.Exists(appDir))
            {
                Directory.Delete(appDir, true);
            }

            Directory.CreateDirectory(appDir);

            using (Stream resource = GetResourceStream(EmbeddedExeResourceName))
            {
                using (FileStream output = File.Create(desktopExePath))
                {
                    resource.CopyTo(output);
                }
            }

            WriteInstallInfo(installRoot, appDir);
            CreateShortcut(Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory), AppName + ".lnk"), desktopExePath);
        }

        private static void WriteInstallInfo(string installRoot, string appDir)
        {
            string configPath = Path.Combine(installRoot, ConfigFileName);
            File.WriteAllText(configPath, appDir, Encoding.UTF8);
        }

        private static void CreateShortcut(string shortcutPath, string targetPath)
        {
            Type shellType = Type.GetTypeFromProgID("WScript.Shell");
            if (shellType == null)
            {
                return;
            }

            dynamic shell = Activator.CreateInstance(shellType);
            dynamic shortcut = shell.CreateShortcut(shortcutPath);
            shortcut.TargetPath = targetPath;
            shortcut.WorkingDirectory = Path.GetDirectoryName(targetPath);
            shortcut.WindowStyle = 1;
            shortcut.Description = AppName;
            shortcut.Save();
        }

        private static System.Drawing.Icon ExtractEmbeddedIcon()
        {
            using (Stream resource = GetResourceStream("yijia-app-icon.png"))
            {
                return System.Drawing.SystemIcons.Application;
            }
        }

        private static Stream GetResourceStream(string path)
        {
            string[] names = Assembly.GetExecutingAssembly().GetManifestResourceNames();
            string resourceName = names.FirstOrDefault(n => n.EndsWith(path.Replace('/', '.').Replace('\\', '.'), StringComparison.OrdinalIgnoreCase));
            if (resourceName == null)
            {
                throw new InvalidOperationException("Missing resource: " + path);
            }

            Stream stream = Assembly.GetExecutingAssembly().GetManifestResourceStream(resourceName);
            if (stream == null)
            {
                throw new InvalidOperationException("Missing resource stream: " + path);
            }

            return stream;
        }
    }

    private sealed class NativeImageBox : PictureBox
    {
        public void LoadImage(Stream source)
        {
            using (source)
            {
                Image = System.Drawing.Image.FromStream(source);
            }
            SizeMode = PictureBoxSizeMode.Zoom;
        }
    }
}

