/**
 * Gulp Taskrunner
 *
 * Integrates Gulp into WeBuilder with GUI panel.
 *
 * @category  WeBuilder Plugin
 * @package   Gulp Taskrunner
 * @author    Peter Klein <pmk@io.dk>
 * @copyright 2018
 * @license   http://www.freebsd.org/copyright/license.html  BSD License
 * @version   1.02
 */

/**
 * [CLASS/FUNCTION INDEX of SCRIPT]
 *
 *    112   function OnWebkitConsoleMessage(Sender, browser, message, source, line, Res)
 *    124   function WebsocketCallback(res, err)
 *    171   function SetServerStatus(status)
 *    201   function IsString(val)
 *    213   function WebsocketSend(cmd, msg)
 *    238   function WebsocketInit()
 *    249   function WebsocketServerStart()
 *    268   function ShowDialog()
 *    359   function CreateDock()
 *    794   function AddRunningTask(taskname, pid)
 *    805   function RemoveRunningTask(pid)
 *    820   function ToggleEnabled(mode)
 *    838   function TogglePanelEnabled(mode)
 *    855   function CreateImageList(size)
 *    894   function AssignImageFromImageList(source, destination, index, size)
 *    917   function OnKeyPressEsc(Sender, key)
 *    932   function OnClickCopyDefaults(Sender)
 *    964   function OnClickSaveCheckboxState(Sender)
 *    970   function OnClickInstallDependencies(Sender)
 *    982   function OnClickToggleServer(Sender)
 *   1003   function OnClickSelectGulpfile(Sender)
 *   1041   function OnClickExecuteTask(Sender)
 *   1072   function OnClickExecuteArbitraryTask(Sender)
 *   1087   function OnClickKillTasks(Sender)
 *   1105   function OnClickUpdateTask(Sender)
 *   1128   function OnChangeSelectGulpfile(Sender)
 *   1151   function OnClickToggleWordwrap(Sender)
 *   1168   function OnClickClearOutput(Sender)
 *   1181   function OnClickCopyOutput(Sender)
 *   1194   function OnClickCopyPath(Sender)
 *   1210   function OnClickOpenInEditor(Sender)
 *   1225   function OnClickGotoParent(Sender)
 *   1246   function OnKeyPressExecuteTask(Sender, key)
 *   1262   function KillAllRunningTasks()
 *   1280   function AddOutput(text, color, style)
 *   1296   function CopyToClipboard(contents)
 *   1315   function HideCaret(Sender)
 *   1334   function OnCanResize(Sender, newWidth, newHeight, resize)
 *   1362   function OnResize(Sender)
 *   1376   function AddTasks(tree, nodesObj, parentNode)
 *   1427   function GetGulpTasks(force)
 *   1465   function InstallDependencies()
 *   1482   function isPackageJsonAvailable()
 *   1501   function IsGulpfileAvailable()
 *   1518   function ParseJson(jsonStr)
 *   1546   function LoadHistory(Sender)
 *   1580   function SaveHistory(Sender)
 *   1627   function ResourceCheck()
 *   1664   function IsNodeJsInstalled()
 *   1684   function IsNodeJsModuleInstalled(module)
 *   1695   function ExpandEnvironmentStrings(str)
 *   1707   function ShortPath(path)
 *   1723   function OpenUrlInBrowser(url)
 *   1746   function CopyFile(source, destination, overwrite)
 *   1760   function OnAfterSelectProject(Sender)
 *   1785   function ToggleDockPanel(Sender)
 *   1801   function Nullify(obj)
 *   1813   function OnDisabled()
 *   1828   function OnExit()
 *   1843   function OnReady()
 *   1870   function OnInstalled()
 *
 * TOTAL FUNCTIONS: 61
 * (This index is automatically created/updated by the WeBuilder plugin "DocBlock Comments")
 *
 */

/**
 * Global vars
 */
var dockPanel = null, PSForm = null, DPSForm = null;
var Panel1 = null, Panel2 = null, Panel3 = null;
var ComboBox1 = null, RichEdit1 = null, TreeView1 = null, ListBox1 = null;
var CheckBox1 = null, CheckBox2 = null, Label22 = null;
var Button4 = null, Button5 = null, Button6 = null, Button7 = null;
var PM0MenuItem1 = null, PM0MenuItem2 = null;
var Image1 = null, ImageList1 = null;
var scriptexec = null;

var debugMode = false;

/**
 * Callback for JavaScript console.log
 * Triggered when a console.log() is issued from a script started with
 * CreateScriptableJsExecuter
 *
 * @param  object   Sender
 * @param  [add type]   browser
 * @param  string   message
 * @param  string   source
 * @param  integer   line
 * @param  [add type]   Res
 *
 * @return void
 */
function OnWebkitConsoleMessage(Sender, browser, message, source, line, Res) {
    if (debugMode) Script.Message("Console.Log: line: " + _t(line) + " : " + source + " : " + message);
}

/**
 * Callback function for recieving Websocket requests
 *
 * @param  object   res JSON Object
 * @param  [add type]   err
 *
 * @return void
 */
function WebsocketCallback(res, err) {
    var json = new TScriptableJSON();
    json.Parse(res);
    var cmd = json.GetValue("cmd"), msg = json.GetValue("msg");

    switch (cmd) {
        case "open": {
            AddOutput(msg, clTeal, 0);
            SetServerStatus(cmd);
        }
        case "close": {
            AddOutput(msg, clTeal, 0);
            SetServerStatus(cmd);
        }
        case "taskstart": {
            var task = Trim(msg + " " + json.GetValue("params"));
            AddRunningTask(task, json.GetValue("pid"));
            AddOutput("Task [" + task + "] started\n", clOlive, 0);
        }
        case "taskend": {
            RemoveRunningTask(json.GetValue("pid"));
            AddOutput("Task [" + Trim(msg + " " + json.GetValue("params")) + "] ended\n", clOlive, 0);
        }
        case "taskkilled": {
            AddOutput("Task [" + Trim(ListBox1.Items[ListBox1.Items.IndexOfObject(TObject(json.GetValue("pid")))]) + "] killed\n", clOlive, 0);
        }
        case "stdout": {
            AddOutput(msg, clWindowText, 0);
        }
        case "stderr": {
            AddOutput(msg, clRed, 0);
        }
        default: {
            AddOutput("Undefined " + cmd + " : " + msg, clPurple, 0);
        }
    }

    delete json;
}

/**
 * Set server status on Button7 and changes icon accordingly
 *
 * @param  bool   status
 *
 * @return void
 */
function SetServerStatus(status) {
    var imageIndex = 2;
    var b7Caption = "Start Server";
    var b7Hint = "Start the shell server";
    var hint = "Server is offline";
    var tag = false;
    var panelsEnabled = false;
    if (status == "open") {
        imageIndex = 1;
        b7Caption = "Stop Server";
        b7Hint = "Stop the shell server";
        hint = "Server is online";
        tag = true;
        panelsEnabled = true;
    }
    AssignImageFromImageList(ImageList1, Image1.Picture, imageIndex, 16);
    Image1.Hint = hint;
    Button7.Caption = b7Caption;
    Button7.Hint = b7Hint;
    Button7.Tag = tag;
    TogglePanelEnabled(panelsEnabled);
}

/**
 * Test if variable is a string
 *
 * @param  mixed   val
 *
 * @return bool    True is val is a string
 */
function IsString(val) {
    return ((VarType(val) && VarTypeMask) == 258); // varUString
}

/**
 * Send data through websocket
 *
 * @param  string   cmd the websocket command
 * @param  string   msg
 *
 * @return void
 */
function WebsocketSend(cmd, msg) {
    if (scriptexec == null) {
        WebsocketInit();
    }

    var json = new TScriptableJSON();
    json.SetValue("cmd", cmd);
    json.SetValue("msg", msg);
    var path = "";
    if (ComboBox1) {
      var tmp = ComboBox1.Items[ComboBox1.ItemIndex];
      if ((IsString(tmp) && tmp != "")) {
        path = ExtractFilePath(tmp);
      }
    }
    json.SetValue("path", path);
    scriptexec.ExecuteJavaScriptFileRequest("", "", json.Stringify, "WebsocketCallback");
    delete json;
}

/**
 * Initialize Websocket connection
 *
 * @return void
 */
function WebsocketInit() {
    scriptexec = Script.CreateScriptableJsExecuter("");
    scriptexec.OnConsoleMessage = "OnWebkitConsoleMessage"; //just for debugging
    scriptexec.ExecuteJavaScriptFileRequest(Script.Path + "websockets.js", "", "", "WebsocketCallback"); //load script
}

/**
 * Start Nodejs Gulp Shell Server in background process
 *
 * @return void
 */
function WebsocketServerStart() {
    var WSO = CreateOleObject("WScript.Shell");
    var cmd = "title Shell Server & node \"" + Script.Path + "wsserver\\ws-server.js\"";

    var windowStyle = 0, windowMode = " /C ";
    if (debugMode) {
        windowStyle = 1;
        windowMode = " /K "
    }

    cmd = ExpandEnvironmentStrings("%WINDIR%\\System32\\cmd.exe") + windowMode + "\"" + cmd + "\"";
    WSO.run(cmd, windowStyle);
}

/**
 * Show dialog for entering arbitrary shell command
 *
 * @return string
 */
function ShowDialog() {

    var oMargin = Round(0 * Script.DpiScale); // Outer margin. for TPanels
    var iMargin = Round(8 * Script.DpiScale); // Inner margin. for other VCL components
    var bvPadding = Round(6 * Script.DpiScale); //Vertical button padding;
    var bhPadding = Round(10 * Script.DpiScale); //Horizontal button padding;

    DPSForm = new TForm(WeBuilder);
    DPSForm.Position = poScreenCenter;
    DPSForm.BorderStyle = bsSingle; //disable dialog resizing
    DPSForm.BorderIcons = biSystemMenu; //remove maximize & minimize buttons
    DPSForm.ClientWidth = 500;
    DPSForm.ClientHeight = 50;
    DPSForm.Font.Size = WeBuilder.Font.Size;
    DPSForm.Font.Name = WeBuilder.Font.Name;
    DPSForm.Caption = "Execute arbritary task";
    DPSForm.Color = clBtnFace;
    DPSForm.Font.Color = clWindowText;

    var DPanel1 = new TPanel(DPSForm);
    DPanel1.Parent = DPSForm;
    DPanel1.BorderStyle = bsNone;
    DPanel1.BevelOuter = bvNone;
    DPanel1.Anchors = akLeft + akTop + akRight + akBottom;
    DPanel1.Top = oMargin;
    DPanel1.Left = oMargin;
    DPanel1.Width = DPSForm.ClientWidth - oMargin - oMargin;

    var DLabel1 = new TLabel(DPSForm);
    DLabel1.Parent = DPanel1;
    DLabel1.Caption = "Shell command:";
    DLabel1.Left = iMargin;
    DLabel1.Top = iMargin + 4;
    DLabel1.Width = DPSForm.Canvas.TextWidth(DLabel1.Caption);
    DLabel1.Height = DPSForm.Canvas.TextHeight(DLabel1.Caption);

    var DComboBox1 = new TComboBox(DPSForm);
    DComboBox1.Parent = DPanel1;
    DComboBox1.Anchors = akLeft + akTop + akRight;
    DComboBox1.Tag = 1; // Used as ident for loading/saving history
    DComboBox1.Top = iMargin + 1;
    DComboBox1.Left = DLabel1.Left + DLabel1.Width + 4;
    DComboBox1.OnKeyPress = "OnKeyPressEsc";
    LoadHistory(DComboBox1);

    var DButton1 = new TButton(DPSForm);
    DButton1.Parent = DPanel1;
    DButton1.Anchors = akTop + akRight;
    DButton1.Caption = "Execute";
    DButton1.Default = true;
    DButton1.ModalResult = mrOk;
    DButton1.Top = DComboBox1.Top + DComboBox1.Height + imargin;
    DButton1.Width = DPSForm.Canvas.TextWidth(DButton1.Caption) + bhPadding + bhPadding;
    DButton1.Height = DPSForm.Canvas.TextHeight("Jj") + bvPadding + bvPadding;
    DButton1.Left = DPanel1.Width - DButton1.Width - iMargin;
    DButton1.OnKeyPress = "OnKeyPressEsc";

    var DButton2 = new TButton(DPSForm);
    DButton2.Parent = DPanel1;
    DButton2.Anchors = akTop + akRight;
    DButton2.Caption = "Cancel";
    DButton2.ModalResult = mrCancel;
    DButton2.Top = DButton1.Top;
    DButton2.Width = DPSForm.Canvas.TextWidth(DButton2.Caption) + bhPadding + bhPadding;
    DButton2.Height = DPSForm.Canvas.TextHeight("Jj") + bvPadding + bvPadding;
    DButton2.Left = DPanel1.Width - DButton1.Width - DButton2.Width - iMargin - iMargin;
    DButton2.OnKeyPress = "OnKeyPressEsc";

    DComboBox1.Width = DPanel1.Width - DLabel1.Width - DLabel1.Left - iMargin - iMargin + 4;

    DPanel1.Height = DButton2.Top + DButton2.Height + iMargin + iMargin;
    DPSForm.ClientHeight = DPanel1.Height + oMargin + oMargin;

    var cmd = "";
    if (DPSForm.ShowModal == mrOK) {
        cmd = Trim(DComboBox1.Text);
        DComboBox1.Items.Insert(0, cmd);
        SaveHistory(DComboBox1);
    }

    // Remove Modal object
    DPSForm = Nullify(DPSForm);

    return cmd;
}

/**
 * Create Gulp docking panel
 *
 * @return void
 */
function CreateDock() {

    var oMargin = Round(0 * Script.DpiScale); // Outer margin. for TPanels
    var iMargin = Round(8 * Script.DpiScale); // Inner margin. for other VCL components
    var bvPadding = Round(6 * Script.DpiScale); //Vertical button padding;
    var bhPadding = Round(10 * Script.DpiScale); //Horizontal button padding;
    var iconSize = 16;

    //create these on script initialization so that their position can be loaded from layouts if previously saved there
    var dockComponent = "GulpDockPanel";

    // Valid values: "" (this will place dock on the general right side of the editor)
    // "dockPanelFileExplorer" (Right - Shared Tab)
    // "dockPanelInspector" ((Right - New panel)
    // "dockPanelOutput" (Bottom - Editor)
    // "dockPanelLanguageBrowser"  (Left - Shared Tab)
    // "dockPanelLibrary" (Left - Shared Tab)
    // "dockPanelSQL" (Left - Shared Tab)
    // "dockPanelCodeExplorer" (Left - Shared Tab)
    dockPanel = new TDockPanel(dockComponent, "dockPanelFileExplorer");
    dockPanel.Caption = "Gulp Panel";

    PSForm = new TForm(WeBuilder);
    PSForm.parent = dockPanel;
    PSForm.BorderStyle = bsNone;
    PSForm.Align = alClient;
    PSForm.Font.Size = WeBuilder.Font.Size;
    PSForm.Font.Name = WeBuilder.Font.Name;
    PSForm.Visible = true;
    PSForm.AutoScroll = true;
    PSForm.HorzScrollBar.Smooth = true;
    PSForm.VertScrollBar.Smooth = true;
    PSForm.HorzScrollBar.Tracking = true;
    PSForm.VertScrollBar.Tracking = true;
    PSForm.OnCanResize = "OnCanResize";
    PSForm.OnResize = "OnResize";

    // Generate TImageList object
    ImageList1 = CreateImageList(iconSize);

    // Panel1 Start
    Panel1 = new TPanel(PSForm);
    Panel1.Parent = PSForm;
    Panel1.BorderStyle = bsNone;
    Panel1.BevelOuter = bvNone;
    Panel1.Anchors = akLeft + akTop + akRight;
    Panel1.Top = oMargin;
    Panel1.Left = oMargin;
    Panel1.Width = PSForm.ClientWidth - oMargin - oMargin;
    // Panel Height is set after components have been inserted into panel

    var Label1 = new TLabel(PSForm);
    Label1.Parent = Panel1;
    Label1.Caption = "Gulp file:";
    Label1.Left = iMargin;
    Label1.Top = iMargin;
    Label1.Width = PSForm.Canvas.TextWidth(Label1.Caption);
    Label1.Height = PSForm.Canvas.TextHeight(Label1.Caption);

    PM0MenuItem1 = new TMenuItem(PSForm);
    PM0MenuItem1.Caption = "Copy to clipboard";
    PM0MenuItem1.Tag = 1;
    PM0MenuItem1.ImageIndex = 4;
    PM0MenuItem1.OnClick = "OnClickCopyPath";
    PM0MenuItem1.Hint = "Copy selected gulpfile.js path to clipboard";

    PM0MenuItem2 = new TMenuItem(PSForm);
    PM0MenuItem2.Caption = "Open in editor";
    PM0MenuItem2.Tag = 2;
    PM0MenuItem2.ImageIndex = 8;
    PM0MenuItem2.OnClick = "OnClickOpenInEditor";
    PM0MenuItem2.Hint = "Open selected gulpfile.js in editor";

    var PopupMenu0 = new TPopupMenu(PSForm);
    PopupMenu0.Images = ImageList1;
    PopupMenu0.Items.Add(PM0MenuItem1);
    PopupMenu0.Items.Add(PM0MenuItem2);

    ComboBox1 = new TComboBox(PSForm);
    ComboBox1.Parent = Panel1;
    ComboBox1.Anchors = akLeft + akTop + akRight;
    ComboBox1.Tag = 0; // Used as ident for loading/saving history
    ComboBox1.Left = iMargin;
    ComboBox1.Top = Label1.Top + Label1.Height + iMargin;
    ComboBox1.Style = csOwnerDrawFixed;//csDropDownList;
    ComboBox1.ShowHint = true;
    ComboBox1.PopupMenu = PopupMenu0;
    ComboBox1.OnChange = "OnChangeSelectGulpfile";
    LoadHistory(ComboBox1);

    var Button1 = new TSpeedButton(PSForm);
    Button1.Parent = Panel1;
    Button1.Anchors = akTop + akRight;
    Button1.Flat = true;
    AssignImageFromImageList(ImageList1, Button1.Glyph, 7, 16);
    Button1.Top = ComboBox1.Top - 1;
    Button1.Width = ComboBox1.Height + 2;
    Button1.Height = ComboBox1.Height + 2;
    Button1.Left = Panel1.Width - Button1.Width - iMargin;
    Button1.OnClick = "OnClickSelectGulpfile";
    Button1.Hint = "Click to select a gulpfile.js";
    Button1.ShowHint = true;
    Button1.NumGlyphs = 1;  // Need 2(3) glyphs, otherwise icon is invisible when enabled= false
    Button1.Enabled = true;

    ComboBox1.Width = Button1.Left - iMargin;

    CheckBox1 = new TCheckBox(PSForm);
    CheckBox1.Parent = Panel1;
    CheckBox1.Caption = "Autoload gulpfile on project change?";
    CheckBox1.Left = iMargin;
    CheckBox1.Top = ComboBox1.Top + ComboBox1.Height + iMargin;
    CheckBox1.Width =  PSForm.Canvas.TextWidth(CheckBox1.Caption) + 18; // 18 px for box + margin
    CheckBox1.Height = PSForm.Canvas.TextHeight(CheckBox1.Caption);
    CheckBox1.Hint = "If checked, changing to a new project will autoselect the project gulpfile.js if available";
    CheckBox1.ShowHint = true;
    CheckBox1.Tag = 1;
    CheckBox1.OnClick = "OnClickSaveCheckboxState";

    CheckBox2 = new TCheckBox(PSForm);
    CheckBox2.Parent = Panel1;
    CheckBox2.Caption = "Remember last selected gulpfile?";
    CheckBox2.Left = iMargin;
    CheckBox2.Top = CheckBox1.Top + CheckBox1.Height + iMargin;
    CheckBox2.Width =  PSForm.Canvas.TextWidth(CheckBox2.Caption) + 18; // 18 px for box + margin
    CheckBox2.Height = PSForm.Canvas.TextHeight(CheckBox2.Caption);
    CheckBox2.Hint = "If checked, the last selected gulpfile.js will be loaded when editor starts";
    CheckBox2.ShowHint = true;
    CheckBox2.Tag = 3;
    CheckBox2.OnClick = "OnClickSaveCheckboxState";

    var ini = new TIniFile(Script.Path + "settings.ini");
    CheckBox1.Checked = ini.ReadBool("Settings", "checkbox1", false);
    CheckBox2.Checked = ini.ReadBool("Settings", "CheckBox2", false);
    delete ini;

    if (!CheckBox2.Checked) {
        // Insert a blank if CheckBox2 is not checked
        ComboBox1.Items.Insert(0, "");
        ComboBox1.ItemIndex = 0;
    }

    Button2 = new TButton(PSForm);
    Button2.Parent = Panel1;
    Button2.Anchors = akTop + akRight;
    Button2.Caption = "Install Dependencies";
    Button2.Top = CheckBox2.Top + CheckBox2.Height + iMargin;
    Button2.Width = PSForm.Canvas.TextWidth(Button2.Caption) + bhPadding + bhPadding;// + Imagelist1.Width;
    Button2.Height = PSForm.Canvas.TextHeight("Jj") + bvPadding + bvPadding;
    Button2.Left = Panel1.Width - Button2.Width - iMargin;
    Button2.DoubleBuffered = true;
    Button2.TabOrder = 1;
    Button2.Enabled = false;
    Button2.OnClick = "OnClickInstallDependencies";
    Button2.Hint = "Install gulp dependencies from package.json";
    Button2.ShowHint = true;
    if (ComboBox1.Items[ComboBox1.ItemIndex] != "") {
        Button2.Enabled = true;
    }

    Button3 = new TButton(PSForm);
    Button3.Parent = Panel1;
    Button3.Anchors = akTop + akRight;
    Button3.Caption = "Copy Defaults";
    Button3.Top = CheckBox2.Top + CheckBox2.Height + iMargin;
    Button3.Width = PSForm.Canvas.TextWidth(Button3.Caption) + bhPadding + bhPadding;// + Imagelist1.Width;
    Button3.Height = PSForm.Canvas.TextHeight("Jj") + bvPadding + bvPadding;
    Button3.Left = Button2.Left - Button3.Width - iMargin;
    Button3.DoubleBuffered = true;
    Button3.OnClick ="OnClickCopyDefaults";
    Button3.Hint = "Copy a default gulpfile.js and package.jsom to selected folder";
    Button3.ShowHint = true;
    Button3.Enabled = true;

    Panel1.Height = Button3.Top + Button3.Height + iMargin;
    // Panel 1 End

    // Panel2 Start
    Panel2 = new TPanel(PSForm);
    Panel2.Parent = PSForm;
    Panel2.BorderStyle = bsNone;
    Panel2.BevelOuter = bvNone;
    Panel2.Anchors = akLeft + akTop + akRight;
    Panel2.Top = Panel1.Top + Panel1.Height + oMargin;
    Panel2.Left = oMargin;
    Panel2.Width = PSForm.ClientWidth - oMargin - oMargin;
    // Panel Height is set after components have been inserted into panel

    var PM1MenuItem1 = new TMenuItem(PSForm);
    PM1MenuItem1.Caption = "Update Gulp Tasklist";
    PM1MenuItem1.Tag = 0;
    PM1MenuItem1.ImageIndex = 10;
    PM1MenuItem1.OnClick = "OnClickUpdateTask";
    PM1MenuItem1.Hint = "Updates list of Gulp tasks from gulpfile.js";

    var PopupMenu1 = new TPopupMenu(PSForm);
    PopupMenu1.Images = ImageList1;
    PopupMenu1.Items.Add(PM1MenuItem1);

    var PM3MenuItem1 = new TMenuItem(PSForm);
    PM3MenuItem1.Caption = "Execute arbitrary task";
    PM3MenuItem1.Tag = 0;
    PM3MenuItem1.ImageIndex = 9;
    PM3MenuItem1.OnClick = "OnClickExecuteArbitraryTask";
    PM3MenuItem1.Hint = "Execute arbitrary Task";

    var PopupMenu3 = new TPopupMenu(PSForm);
    PopupMenu3.Images = ImageList1;
    PopupMenu3.Items.Add(PM3MenuItem1);

    var Label2 = new TLabel(PSForm);
    Label2.Parent = Panel2;
    Label2.Caption = "Gulp Tasks:";
    Label2.Left = iMargin;
    Label2.Top = iMargin;
    Label2.Width = PSForm.Canvas.TextWidth(Label2.Caption);
    Label2.Height = PSForm.Canvas.TextHeight(Label2.Caption);

    Label22 = new TLabel(PSForm);
    Label22.Parent = Panel2;
    Label22.Anchors = akTop + akRight;
    Label22.Caption = "Updating Tasklist";
    Label22.Width = PSForm.Canvas.TextWidth(Label22.Caption) + 10; // 10px to compensate for for bold
    Label22.Height = PSForm.Canvas.TextHeight(Label22.Caption);
    Label22.Left = Panel2.Width - Label22.Width - iMargin;
    Label22.Top = iMargin;
    Label22.BiDiMode = 1;
    Label22.StyleElements = seClient + seBorder; // Enable colors in Dark Layouts
    Label22.Font.Color = clRed;
    Label22.Font.Style = fsBold;
    Label22.Visible = false;

    // https://stackoverflow.com/questions/8445410/custom-treeview-draw-bug-on-mouseover-collapse-expand-glyph
    TreeView1 = new TTreeView(PSForm);
    TreeView1.Parent = Panel2;
    TreeView1.Anchors = akLeft + akTop + akRight;
    TreeView1.Indent = 19;
    TreeView1.HideSelection = false;
    TreeView1.Left = iMargin;
    TreeView1.Top = Label2.Top + Label2.Height + iMargin;
    TreeView1.Width = Panel2.Width - iMargin - iMargin;
    TreeView1.Height = (Abs(TreeView1.Font.Height) + 6)* 8 + 6; // 8 lines
    TreeView1.TabOrder = 0;
    TreeView1.ReadOnly = true;
    TreeView1.Images = ImageList1;
    TreeView1.PopupMenu = PopupMenu1;
    TreeView1.OnClick = "OnClickGotoParent";
    TreeView1.OnKeyPress = "OnKeyPressExecuteTask";
    TreeView1.Hint = "Available Gulp Task";
    TreeView1.ShowHint = true;

    Button4 = new TButton(PSForm);
    Button4.Parent = Panel2;
    Button4.Anchors = akTop + akRight;
    Button4.Caption = "Execute Task";
    Button4.Top = TreeView1.Top + TreeView1.Height + iMargin;
    Button4.Width = PSForm.Canvas.TextWidth(Button4.Caption) + bhPadding + bhPadding + 16;// + Imagelist1.Width;
    Button4.Height = PSForm.Canvas.TextHeight("Jj") + bvPadding + bvPadding;
    Button4.Left = Panel2.Width - Button4.Width - iMargin;
    Button4.DoubleBuffered = true;
    Button4.TabOrder = 1;
    Button4.OnClick = "OnClickExecuteTask";
    Button4.Hint = "Executes selected Gulp Task";
    Button4.ShowHint = true;
    Button4.DropDownMenu = PopupMenu3;
    Button4.Style = 2; // bsSplitButton;

    Button5 = new TButton(PSForm);
    Button5.Parent = Panel2;
    Button5.Anchors = akTop + akRight;
    Button5.Caption = "Kill Task";
    Button5.Top = TreeView1.Top + TreeView1.Height + iMargin;
    Button5.Width = PSForm.Canvas.TextWidth(Button5.Caption) + bhPadding + bhPadding;// + Imagelist1.Width;
    Button5.Height = PSForm.Canvas.TextHeight("Jj") + bvPadding + bvPadding;
    Button5.Left = Button4.Left - Button5.Width - iMargin;
    Button5.DoubleBuffered = true;
    Button5.OnClick ="OnClickKillTasks";
    Button5.Hint = "Kill running task selected";
    Button5.ShowHint = true;
    Button5.Enabled = true;

    ListBox1 = new TListBox(PSForm);
    ListBox1.Parent = Panel2;
    ListBox1.Anchors = akLeft + akTop + akRight;
    ListBox1.Left = iMargin;
    ListBox1.Top = Button5.Top + Button5.Height + iMargin;
    ListBox1.Width = Panel2.Width - iMargin - iMargin;
    ListBox1.Height = (Abs(ListBox1.Font.Height) + 3) * 5; // 5 lines
    ListBox1.Hint = "Tasks currently running. Use the 'Kill Task' button to kill selected task";
    ListBox1.ShowHint = true;

    //Panel2.Height = Button4.Top + Button4.Height + iMargin;
    Panel2.Height = ListBox1.Top + ListBox1.Height + iMargin;
    // Panel 2 End

    // Panel 3 Start
    Panel3 = new TPanel(PSForm);
    Panel3.Parent = PSForm;
    Panel3.BorderStyle = bsNone;
    Panel3.BevelOuter = bvNone;
    Panel3.Anchors = akLeft + akTop + akRight;
    Panel3.Top = Panel2.Top + Panel2.Height + oMargin;
    Panel3.Left = oMargin;
    Panel3.Width = PSForm.ClientWidth - oMargin - oMargin;
    // Panel Height is set after components have been inserted into panel

    var PM2MenuItem1 = new TMenuItem(PSForm);
    PM2MenuItem1.Caption = "Copy to clipboard";
    PM2MenuItem1.Tag = 1;
    PM2MenuItem1.Imageindex = 4;
    PM2MenuItem1.OnClick = "OnClickCopyOutput";
    PM2MenuItem1.Hint = "Copy contents of the Shell Output window to clipboard";

    var PM2MenuItem2 = new TMenuItem(PSForm);
    PM2MenuItem2.Caption = "Clear output window";
    PM2MenuItem2.Tag = 0;
    PM2MenuItem2.Imageindex = 3;
    PM2MenuItem2.OnClick ="OnClickClearOutput";
    PM2MenuItem2.Hint = "Clear contents of the Shell Output window";

    var PM2MenuItem3 = new TMenuItem(PSForm);
    PM2MenuItem3.Caption = "Toggle Wordwrap";
    PM2MenuItem3.Tag = 2;
    PM2MenuItem3.Imageindex = 11;
    PM2MenuItem3.OnClick ="OnClickToggleWordwrap";
    PM2MenuItem3.Hint = "Toggle word wrapping on/off";

    var PopupMenu2 = new TPopupMenu(PSForm);
    PopupMenu2.Images = ImageList1;
    PopupMenu2.Items.Add(PM2MenuItem1);
    PopupMenu2.Items.Add(PM2MenuItem2);
    PopupMenu2.Items.Add(PM2MenuItem3);

    var Label3 = new TLabel(PSForm);
    Label3.Parent = Panel3;
    Label3.Caption = "Shell Output:";
    Label3.Left = iMargin;
    Label3.Top = iMargin;
    Label3.Width = PSForm.Canvas.TextWidth(Label3.Caption);
    Label3.Height = PSForm.Canvas.TextHeight(Label3.Caption);

    RichEdit1 = new TRichEdit(PSForm);
    RichEdit1.Parent = Panel3;
    RichEdit1.Anchors = akLeft + akTop + akRight;
    RichEdit1.ReadOnly = true;
    RichEdit1.Left = iMargin;
    RichEdit1.Font.Name = "Consolas";
    RichEdit1.Font.Size = WeBuilder.Font.Size;// + 1;
    RichEdit1.Top = Label3.Top + Label3.Height + iMargin;
    RichEdit1.Width = Panel3.Width - iMargin - iMargin;
    RichEdit1.Height = (Abs(RichEdit1.Font.Height) + 3) * 8 + 15; // 5 Lines + 15px to compensate for scrollbar
    RichEdit1.Cursor = crArrow;
    RichEdit1.OnEnter = "HideCaret";
    RichEdit1.ScrollBars = ssBoth;
    RichEdit1.WordWrap = false;
    RichEdit1.TabOrder = 2;
    RichEdit1.Hint = "Shell output window";
    RichEdit1.ShowHint = true;
    RichEdit1.PopupMenu = PopupMenu2;
    RichEdit1.StyleElements = seClient + seBorder; // Enable colors in Dark Layouts

    Panel3.Height = RichEdit1.Top + RichEdit1.Height + iMargin;
    // Panel 3 End

    // Panel 4 Start
    var Panel4 = new TPanel(PSForm);
    Panel4.Parent = PSForm;
    Panel4.BorderStyle = bsNone;
    Panel4.BevelOuter = bvNone;
    Panel4.Anchors = akLeft + akTop + akRight;
    Panel4.Top = Panel3.Top + Panel3.Height + oMargin;
    Panel4.Left = oMargin;
    Panel4.Width = PSForm.ClientWidth - oMargin - oMargin;
    // Panel Height is set after components have been inserted into panel

    var Label4 = new TLabel(PSForm);
    Label4.Parent = Panel4;
    Label4.Caption = "Shell Server Status:";
    Label4.Left = iMargin;
    Label4.Top = iMargin + bvPadding;
    Label4.Width = PSForm.Canvas.TextWidth(Label4.Caption);
    Label4.Height = PSForm.Canvas.TextHeight(Label4.Caption);

    Image1 = new TImage(PSForm);
    Image1.Parent = Panel4;
    Image1.Left = Label4.Left + Label4.Width + 3;
    Image1.Top = Label4.Top;
    Image1.Width = 16;
    Image1.Height = 16;
    Image1.AutoSize = true;
    Image1.ShowHint = true;
    AssignImageFromImageList(ImageList1, Image1.Picture, 0, 16);

    Button7 = new TButton(PSForm);
    Button7.Parent = Panel4;
    Button7.Anchors = akTop + akRight;
    Button7.Caption = "Stop Server";
    Button7.Top = iMargin;
    Button7.Width = PSForm.Canvas.TextWidth(Button7.Caption) + bhPadding + bhPadding + 6; // Extra spacing for Start Server caption
    Button7.Height = PSForm.Canvas.TextHeight("Jj") + bvPadding + bvPadding;
    Button7.Left = Panel3.Width - Button7.Width - iMargin;
    Button7.DoubleBuffered = true;
    Button7.OnClick ="OnClickToggleServer";
    Button7.Tag = false;
    Button7.Hint = "Stop the shell server";
    Button7.ShowHint = true;

    Panel4.Height = Button7.Top + Button7.Height + iMargin;
    // Panel 3 End

    if (ComboBox1.Items[0] != "") {
        // Populate TreeView object. Must be done after rendering output window, in order to display error messages.
        var taskJson = GetGulpTasks(false);
        if (taskJson != "") {
            //TreeView1.SetFocus(); // Fails as panel is not visible yet
            TreeView1.Items.Clear;
            AddTasks(TreeView1, ParseJson(taskJson), nil);
        }
    }
    else {
        // Disable buttons if no gulpfile.js is selected
        ToggleEnabled(false);
    }

    return dockPanel;
}

/**
 * Add running task to tasklist (ListBox1)
 *
 * @param  string   taskname name of task
 * @param  integer   pid task id
 *
 * @return void
 */
function AddRunningTask(taskname, pid) {
    ListBox1.Items.AddObject(taskname, TObject(pid));
}

/**
 * Remove running task from tasklist (ListBox1)
 *
 * @param  integer   pid task id
 *
 * @return void
 */
function RemoveRunningTask(pid) {
    var index = ListBox1.Items.IndexOfObject(TObject(pid));
    if (index > -1) {
        ListBox1.Items.Delete(index);
    }
}

/**
 * Set the enabled state of buttons and popupmenu items
 * based on if a gulpfile.js have been selected or not
 *
 * @param  bool   mode
 *
 * @return void
 */
function ToggleEnabled(mode) {
    // Buttons
    Button2.Enabled = mode;
    Button4.Enabled = mode;
    Button5.Enabled = mode;
    Button6.Enabled = mode;
    // Popup menu items
    PM0MenuItem1.Enabled = mode;
    PM0MenuItem2.Enabled = mode;
}

/**
 * Toggle enable state of panels
 *
 * @param  bool   mode Panels enable state
 *
 * @return void
 */
function TogglePanelEnabled(mode) {
    // Panels
    // Needs a check for null as this function can be called before form is available
    if ((Panel1 != null) && (Panel2 != null) && (Panel3 != null)) {
        Panel1.Enabled = mode;
        Panel2.Enabled = mode;
        Panel3.Enabled = mode;
    }
}

/**
 * Create TImageList object from sprite image
 *
 * @param  integer   size
 *
 * @return object   TImageList
 */
function CreateImageList(size) {
    var ImageList1 = new TImageList(PSForm);
    ImageList1.ColorDepth = 6; // cd32Bit
    ImageList1.DrawingStyle = 3; //dsTransparent;
    ImageList1.SetSize(size, size);

    var darkTheme = Script.IsDarkTheme; // true if dark theme is selected
    var offset = darkTheme*darkTheme*size;

    var Bitmap1 = new TBitmap;
    Bitmap1.Create;
    Bitmap1.LoadFromFile(Script.Path + "images/icons16.bmp");
    var imageCount = Bitmap1.Height / size;

    var Bitmap2 = new TBitmap;
    Bitmap2.Create;
    Bitmap2.Width = size;
    Bitmap2.Height = size;

    for (var i=0;i<imageCount;i++) {
        Bitmap2.Canvas.Draw(-offset, -size*i, Bitmap1);
        ImageList1.Add(Bitmap2, nil);
    }
    Bitmap2.Free;
    Bitmap1.Free;

    return ImageList1;
}

/**
 * Assign image from TImagelist to Image property
 *
 * @param  object   source TImagelist
 * @param  object   destination image property
 * @param  int      index
 * @param  int      size
 *
 * @return void
 */
function AssignImageFromImageList(source, destination, index, size) {
    var B = TBitmap.Create;
    B.Width = size;
    B.Height = size;
    B.Canvas.Brush.Style = bsSolid;
    B.Canvas.Brush.Color = clBtnFace;
    B.Canvas.Pen.Color = clBtnFace;
    B.Canvas.Rectangle(0, 0, size, size);
    source.Draw(B.Canvas, 0, 0, index, true);
    //destination.Picture.Assign(B);
    destination.Assign(B);
    delete B;
}

/**
 * OnKeyPress callback handler for DButton1, DButton2 and DComboBox1
 * Allows user to exit modal window by pressing ESC
 *
 * @param  object   Sender
 * @param  string   key
 *
 * @return string
 */
function OnKeyPressEsc(Sender, key) {
    if (key == chr(27)) {
        // Escape key pressed on GUI item
        DPSForm.ModalResult = mrCancel;	// Close modal window
    }
    return key;
}

/**
 * Copy a default gulpfile.js and package.json into the current document root
 *
 * @param  object   Sender
 *
 * @return void
 */
function OnClickCopyDefaults(Sender) {
    var path = ExtractFilePath(Document.FileName);
    if (BrowseForFolder(path, "Select folder for gulpfile.js", true)) {
        if (path != "") {
            var res = true;
            if (FileExists(path + "gulpfile.js")) {
                res = Confirm("A gulpfile.js already exists in selected folder.\nDo you wnat to overwrite it?");
            }
            if (res) {
                CopyFile(Script.Path + "default_gulpfile\\gulpfile.js", path + "\\", true);
                CopyFile(Script.Path + "default_gulpfile\\package.json", path + "\\", true);

                ComboBox1.Items.Insert(0, path + "\\gulpfile.js"); // Add to top of items list
                ComboBox1.ItemIndex = 0;
                SaveHistory(ComboBox1);
                LoadHistory(ComboBox1);
                ToggleEnabled(true);

                Script.Status = "Default gulpfile.js and package.json have been copied to selected folder";
            }
        }
    }
}

/**
 * Save checkbox state to settings file
 * Note: Checkbox object must have "Tag" property set to generate name
 *
 * @param  object   Sender
 *
 * @return void
 */
function OnClickSaveCheckboxState(Sender) {
    var ini = new TIniFile(Script.Path + "settings.ini");
    ini.WriteBool("Settings", "checkbox" + _t(Sender.Tag), Sender.Checked);
    delete ini;
}

function OnClickInstallDependencies(Sender) {
    InstallDependencies();
}

/**
 * Toggle Shell Server on/off
 * Note: Uses TButton "Tag" property to determine state
 *
 * @param  object   Sender
 *
 * @return void
 */
function OnClickToggleServer(Sender) {
    if (Sender.Tag) {
        // Send shutdown signal
        var json = new TScriptableJSON();
        json.SetValue("cmd", "shutdown");
        scriptexec.ExecuteJavaScriptFileRequest("", "", json.Stringify, "WebsocketCallback");
        delete json;
    }
    else {
        WebsocketServerStart();
        WebsocketInit();
    }
}

/**
 * Open filedialog for selecting gulpfile.js
 *
 * @param  object   Sender
 *
 * @return void
 */
function OnClickSelectGulpfile(Sender) {
    var dialog = new TOpenDialog(PSForm);
    dialog.DefaultExt = "js";
    dialog.Title = "Select gulpfile.js";
    dialog.InitialDir = ExtractFilePath(Document.FileName);
    dialog.Options = ofNoDereferenceLinks;
    dialog.Filter = "gulpfile.js files |gulpfile.js";
    if (dialog.Execute) {
        var gulpfile = dialog.FileName;
        delete dialog;
        var filename = LowerCase(ExtractFileName(gulpfile));
        if (filename != "gulpfile.js") {
            alert("Error: Selected file \"" + filename + "\" should be a \"gulpfile.js\"");
        }
        else {
            KillAllRunningTasks();
            ComboBox1.Items.Insert(0, gulpfile); // Add to top of items list
            ComboBox1.ItemIndex = 0;
            SaveHistory(ComboBox1);
            LoadHistory(ComboBox1);
            var taskJson = GetGulpTasks(false);
            if (taskJson != "") {
                TreeView1.Items.Clear;
                AddTasks(TreeView1, ParseJson(taskJson), nil);
            }
            ToggleEnabled(true);
        }
    }
}

/**
 * OnClick callback function for Button4
 * Executes selected Gulp task
 *
 * @param  object   Sender
 *
 * @return void
 */
function OnClickExecuteTask(Sender) {
    Panel2.Enabled = false;
    var task = "";
    var node = TreeView1.Selected;
    if (node != nil) {
        var parentNode = node.Data;
        if (parentNode != nil) {
            node = parentNode;
            TreeView1.Selected = node;
        }
        task = node.Text;
    }
    if (task == "") {
        AddOutput("No Gulp task selected!", clRed, 0);
    }
    else {
        WebsocketSend("starttask", "gulp " + task);
        Script.Status = "Gulp task [" + task + "] executed";
    }
    Panel2.Enabled = true;
    TreeView1.SetFocus();
}

/**
 * OnClick callback for PopupMenu3 (Button4 DropDownMenu)
 * Shows prompt for entering arbitrary command
 *
 * @param  object   Sender
 *
 * @return void
 */
function OnClickExecuteArbitraryTask(Sender) {
    var task = ShowDialog();
    //var task = Prompt("Shell command", "");
    if (task != "") {
        WebsocketSend("starttask", task);
    }
}

/**
 * Kill selected task from pid stored in ListBox1 TObject
 *
 * @param  object   Sender
 *
 * @return void
 */
function OnClickKillTasks(Sender) {
    var index = ListBox1.ItemIndex;
    if (index > -1) {
        WebsocketSend("killtask", ListBox1.Items.Objects[index]);
    }
    else {
        Alert("No task selected!");
    }
}

/**
 * OnClick callback function for Button5
 * Updates list of Gulp tasks
 *
 * @param  object   Sender
 *
 * @return void
 */
function OnClickUpdateTask(Sender) {
    Label22.Visible = true;
    Panel2.Enabled = false;
    var taskJson = GetGulpTasks(true);
    if (taskJson != "") {
        TreeView1.Items.Clear;
        AddTasks(TreeView1, ParseJson(taskJson), nil);
        AddOutput("Gulp tasks updated\n", clGreen, 0);
        Script.Status = "Gulp tasks updated";
    }
    Panel2.Enabled = true;
    Label22.Visible = false;
    TreeView1.SetFocus();
}

/**
 * OnChange callback for ComboBox1
 * Saves new gulpfile history and updates the Gulp Tasklist
 *
 * @param  object   Sender
 *
 * @return void
 */
function OnChangeSelectGulpfile(Sender) {
    KillAllRunningTasks();
    SaveHistory(Sender);
    LoadHistory(Sender);
    var mode = false;
    if (Sender.Items[0] != "") {
        mode = true;
        var taskJson = GetGulpTasks(false);
        if (taskJson != "") {
            TreeView1.Items.Clear;
            AddTasks(TreeView1, ParseJson(taskJson), nil);
        }
    }
    ToggleEnabled(mode);
}

/**
 * Toggle word wrapping in output window RichEdit1
 *
 * @param  object   Sender
 *
 * @return void
 */
function OnClickToggleWordwrap(Sender) {
    RichEdit1.WordWrap = !(RichEdit1.WordWrap);
    if (RichEdit1.WordWrap) {
        RichEdit1.ScrollBars = ssVertical;
    }
    else {
        RichEdit1.ScrollBars = ssBoth;
    }
}
/**
 * OnClick callback function for Button5
 * Clears the Gulp output window
 *
 * @param  object   Sender
 *
 * @return void
 */
function OnClickClearOutput(Sender) {
    RichEdit1.Lines.Clear;
    Script.Status = "Gulp output window cleared";
}

/**
 * OnClick callback function for Button5
 * Copies the content of the Gulp output window to clipboard
 *
 * @param  object   Sender
 *
 * @return void
 */
function OnClickCopyOutput(Sender) {
    CopyToClipboard(RichEdit1.Lines.Text);
    Script.Status = "Gulp output copied to Clipboard";
}

/**
 * OnClick callback function for PopupMenu1
 * Copies the gulpfile.js path from ComboBox1 to clipboard
 *
 * @param  object   Sender
 *
 * @return void
 */
function OnClickCopyPath(Sender) {
    var file = ComboBox1.Items[ComboBox1.ItemIndex];
    if (file != "") {
        CopyToClipboard(file);
        Script.Status = "Gulpfile.js path copied to Clipboard";
    }
}

/**
 * OnClick callback function for PopupMenu1
 * Opens the gulpfile.js from ComboBox1 in editor
 *
 * @param  object   Sender
 *
 * @return void
 */
function OnClickOpenInEditor(Sender) {
    var file = ComboBox1.Items[ComboBox1.ItemIndex];
    if (file != "") {
        Documents.OpenDocument(file);
    }
}

/**
 * OnClick callback function for TTreeView1
 * Prevents user from selecting subitems by selecting the top parent node
 *
 * @param  object   Sender TTreeView object
 *
 * @return void
 */
function OnClickGotoParent(Sender) {
    var node = Sender.Selected;
    if (node != nil) {
        var parentNode = node.Data;
        while (parentNode != nil) {
            node = parentNode;
            parentNode = node.Data;
        }
        Sender.Selected = node;
    }
}

/**
 * OnKeyPress callback handler for TTreeView1
 * Allows user to execute task by pressing Enter.
 *
 * @param  object   Sender
 * @param  string   key
 *
 * @return string
 */
function OnKeyPressExecuteTask(Sender, key) {
    // Enter key pressed on GUI item
    if (key == chr(13)) {
        // Ensure that main item is selected
        OnClickGotoParent(TreeView1);
        // Execute selected task
        OnClickExecuteTask(TreeView1);
    }
    return key;
}

/**
 * Kill all running tasks before switching gulpfile
 *
 * @return void
 */
function KillAllRunningTasks() {
    if (ListBox1.Items.Count > 0) {
        if (Confirm("Kill running tasks before switching gulpfile?") == true) {
            for (var i=ListBox1.Items.Count-1;i>-1;i--) {
                WebsocketSend("killtask", ListBox1.Items.Objects[i]);
            }
        }
    }
}
/**
 * Add line of text to gulp output window
 *
 * @param  string    text
 * @param  integer   color
 * @param  integer   style
 *
 * @return void
 */
function AddOutput(text, color, style) {
    RichEdit1.SelAttributes.Color = color;
    RichEdit1.SelAttributes.Style = style;
    RichEdit1.SelText = text;
    RichEdit1.SelAttributes.Color = clWindowText;
    RichEdit1.SelAttributes.Style = 0;
    RichEdit1.SetCaretPos(0, RichEdit1.Lines.Count);
}

/**
 * Copy contents to Clipboard
 *
 * @param  string   contents the contents to place on clipboard
 *
 * @return void
 */
function CopyToClipboard(contents) {
    var ED = new TEdit(PSForm);
    ED.Parent = WeBuilder;
    ED.Text = contents;
    ED.SelectAll();
    ED.CopyToClipboard();

    // Object cleanup
    delete ED;
}

/**
 * OnEnter callback for use in TRichEdit or TEdit.
 * Hide caret in TRichEdit or TEdit when in ReadOnly Mode
 *
 * @param  object   Sender
 *
 * @return void
 */
function HideCaret(Sender) {
    if (Sender.ReadOnly == true) {
        // "WeBuilder" MUST be used instead of "PSForm" object.
        // Otherwise Webuilder crashes if form is in a docking panel
        WeBuilder.ActiveControl  = Sender.Parent;
    }
}

/**
 * OnCanResize callback function for TForm
 * Connstrains the resizing of modal window
 *
 * @param  object   Sender TForm object
 * @param  int      NewWidth
 * @param  int      NewHeight
 * @param  boolean  Resize set to false to prevent resizing
 *
 * @return void
 */
function OnCanResize(Sender, newWidth, newHeight, resize) {
    var mode = "vertical";
    if ((newWidth > newHeight) && (newHeight > 300)) {
        mode = "horizontal";
    }
    //Script.Message("Docking panel mode: " + mode + " (w" + _t(newWidth) + ":h" + _t(newHeight) + ")");
    //var aa = newWidth;
    //Script.Message("New Width: " + _t(newWidth));
    //Script.Message("New Height: " + _t(newHeight));
/*
    if ((Sender.Width == newWidth) && (Sender.Height == newHeight)) {
        //resize = false;
    }
    else {
        Script.Message("New Width: " + _t(newWidth));
        Script.Message("New Height: " + _t(newHeight));
    }*/
}

/**
 * OnResize callback function for TForm
 * Prevent bug from appearing. If scrollbar is visible and not in 0 positiion, then
 * resizing the editor so that scrollbar is invisible, will increase the right margin.
 *
 * @param  object   Sender
 *
 * @return void
 */
function OnResize(Sender) {
    PSForm.HorzScrollBar.Position = 0;
    PSForm.VertScrollBar.Position = 0;
}

/**
 * Add tasks to treeview object recursively
 *
 * @param  object   tree TTreeView object
 * @param  array    nodesObj JSON object
 * @param  object   parentNode TTreeNode object
 *
 * @return string   path to gulpfile.js
 */
function AddTasks(tree, nodesObj, parentNode) {
    if (parentNode == nil) {
        var hint = nodesObj.getProp("label");
        tree.Hint = hint;
    }
    var nodes = nodesObj.getProp("nodes");
    for (var j=0;j<nodes.length;j++) {
        var record = nodes.getProp(j);
        var label = record.getProp("label");
        var type = record.getProp("type");
        var subnodes = record.getProp("nodes");
        if (type == "task") {
            var newNode = tree.Items.AddChild(parentNode, label);
            // Using the "Data" property to store the parentNode value
            newNode.Data = parentNode;
            newNode.Text = label;

            if (parentNode == nil) {
                // Tasks
                newNode.ImageIndex = 5;
                newNode.SelectedIndex = 5;
            }
            else {
                // Subtasks
                newNode.ImageIndex = 6;
                newNode.SelectedIndex = 6;
            }

            // Make root "default" task selected
            if ((label == "default") && (parentNode == nil)) {
                tree.Selected = newNode;
            }

            // Process subnodes
            if (subnodes.length > 0) {
                AddTasks(tree, record, newNode);
            }
        }
    }
}

/**
 * Get the list of Gulp tasks available in gulpfile.js
 * First tries to get the tasks from a local saved copy of the JSON array
 * if this fails, it will call Gulp with the --tasks-json option and save the result in
 * local settings file.
 *
 * @param  boolean    force Force updating from gulpfile.js
 *
 * @return string  JSON string
 */
function GetGulpTasks(force) {
    var gulpfile = ComboBox1.Items[0];
    if (gulpfile != "") {
        var path = ExtractFilePath(gulpfile);
        var ini = new TIniFile(Script.Path + "settings.ini");
        // Get tasklist stored in ini file
        var taskJson = ini.ReadString(gulpfile, "tasks", "");
        if ((taskJson == "") || (force == true)) {
            var cmd = ExpandEnvironmentStrings("%USERPROFILE%\\AppData\\Roaming\\npm\\gulp.cmd") + " --tasks-json --cwd " + ShortPath(path) + "\\";
            // --cwd parameter doesn't work with spaces, and quoting it only fixes the problem partly. (An extra end quote is added at end??)
            // var cmd = WSO.ExpandEnvironmentStrings("%USERPROFILE%\\AppData\\Roaming\\npm\\gulp.cmd") + " --tasks-json --cwd \"" + path + "\"";
            // Get gulpfile.js tasklist from calling gulp with --tasks-json parameter (slow)
            var gulpResults = "";
            ExecuteCommand(cmd, gulpResults);
            taskJson = Trim(RegexMatch(gulpResults, "{.+", false));

            // Save tasklist in ini file
            ini.WriteString(gulpfile, "tasks", taskJson);
        }
        delete ini;

        if (taskJson == "") {
            // No gulp tasks found
            AddOutput("Error: No Gulp tasks found!\n" + gulpResults, clRed, 0);
        }
        else {
            // Return the JSON string
            return taskJson;
        }
    }
    return "";
}

/**
 * Install nodejs local module dependencies from package.json through websocket
 *
 * @return void
 */
function InstallDependencies() {
    var path = ExtractFilePath(ComboBox1.Text);
    if (path != "") {
        var pjFile = path + "\package.json";
        if (FileExists(pjFile) == true) {
            // Deletet .lock file
            AddOutput("Installing gulp dependencies from \"" + pjFile + "\"\n", clGreen, 0);
            WebsocketSend("starttask", "npm install");
        }
    }
}

/**
 * Checks if "package.json" is available in current folder.
 *
 * @return boolean
 */
function isPackageJsonAvailable() {
    var path = ExtractFilePath(Document.FileName);
    var res = true;
    if (FileExists(path + "package.json") == false) {
        res = false;
        if (Confirm("No package.json found in current path.\nCopy the default package.json and gulpfile.js to current path?")) {
            CopyFile(Script.Path + "package.json", path + "package.json", true);
            CopyFile(Script.Path + "gulpfile.js", path + "gulpfile.js", true);
            res = true;
        }
    }
    return res;
}

/**
 * Checks if "gulpfile.js" is available in current folder.
 *
 * @return boolean
 */
function IsGulpfileAvailable() {
    return true;
}

/**
 * JSON parser using "htmlfile" OLE object.
 * Has better support for parsing complex JSON objects compared to TScriptableJSON
 *
 * The JSON result object is extended with two custom methods, making data fully
 * accessible from FastScript. Custom methods:
 * 	  getProp(key/index) to access properties by index or name
 * 	  getKeys(dummy) to get list of keys
 *
 * @param  string   jsonStr The JSON string to parse
 *
 * @return mixed    variant or empty string if failure
 */
function ParseJson(jsonStr) {

    // Create htmlfile COM object
    var HFO = CreateOleObject("htmlfile"), jsonObj;

    // force htmlfile to load Chakra engine
    HFO.write("<meta http-equiv='x-ua-compatible' content='IE=9' />");

    // Add custom method to objects
    HFO.write("<script type='text/javascript'>Object.prototype.getProp=function(t){return this[t]},Object.prototype.getKeys=function(){return Object.keys(this)};</script>");

    // Parse JSON string
    try jsonObj = HFO.parentWindow.JSON.parse(jsonStr);
    except jsonObj = ""; // JSON parse error

    // Unload COM object
    HFO.close();

    return jsonObj;
}

/**
 * Load TComboBox history
 *
 * @param  TComboBox   Sender
 *
 * @return void
 */
function LoadHistory(Sender) {
    var val, i;
    var ini = new TIniFile(Script.Path + "history.ini");
    var SL = new TStringList;
    var section = "Gulpfile History";
    if (Sender.Tag == 1) section = "Arbitary Command History";

    if (ini.SectionExists(section)) {
        ini.ReadSectionValues(section, SL);
        Sender.Items.Clear;
        for (i=0;i<SL.Count;i++) {
            val = RegexReplace(SL[i],"^\\d*=", "", true);
            if (val!="") {
                Sender.Items.Add(val);
            }
        }
        if (Sender.Items.Count > 0) {
            Sender.ItemIndex = 0;
            Sender.Hint = Sender.Items[0];
        }
    }

    // Object Cleanup
    delete SL;
    delete ini;
}

/**
 * Save TComboBox history
 *
 * @param  TComboBox   Sender
 *
 * @return void
 */
function SaveHistory(Sender) {
    var ini = new TIniFile(Script.Path + "history.ini");
    var SL = new TStringList;
    var i, j, dupe;
    var section = "Gulpfile History";
    if (Sender.Tag == 1) section = "Arbitary Command History";

    // Add the selected item as 1st item
    SL.Add(Sender.Items[Sender.ItemIndex]);

    // Add existing history items
    for (i = 0; i < Sender.Items.Count; i++) {
        // Skip duplicates. (TStringList dupe functionality only works when list is sorted)
        dupe = false;
        for (j = 0; j < SL.Count; j++) {
            if (Lowercase(Sender.Items[i]) == Lowercase(SL[j])) {
                dupe = true;
                break;
            }
        }
        if (!dupe) {
            SL.Add(Sender.Items[i]);
        }
    }

    if (ini.SectionExists(section)) {
        // Clear section
        ini.EraseSection(section);
    }

    // Save updated history
    for (i = 0; (i < SL.Count) && (i < 10); i++) {
        if (SL[i] != "") {
            ini.WriteString(section, i, SL[i]);
        }
    }

    // Object Cleanup
    delete SL;
    delete ini;
}

/**
 * Checks if resources required for plugin, is installed on system
 *
 * @return boolean
 */
function ResourceCheck() {
    var res = true;

    // Check if Nodejs application is installed
    if (!IsNodeJsInstalled()) {
        var link = "https://nodejs.org/en/";
        CopyToClipboard(link);
        if (Confirm("NodeJS application not found on system.\nYou can download it at: " + link + "\n\nOpen the download link in browser?\n(link has also been copied to clipboard)")) {
            OpenUrlInBrowser(link);
        }
        return false;
    }

    // Check if global module gulp-cli is installed
    var module = "gulp-cli";
    if (!IsNodeJsModuleInstalled(module)) {
        if (Confirm("Global NodeJS module \"" + module + "\" not found on system.\n\nDownload and install it?")) {
            v//ar cmd = ExpandEnvironmentStrings("%USERPROFILE%\\AppData\\Roaming\\npm\\npm.cmd");
            var cmd = "npm.cmd";
            var out = "";
            WSO.run("cmd.exe /C \""+ cmd + " install " + module + " -g & pause\"", 1, 1);
            // Recheck module installation
            res = ResourceCheck();
        };
        else {
            return false;
        }
    }

    return res;
}

/**
 * Test if NodeJS application is installed or not
 *
 * @return boolean
 */
function IsNodeJsInstalled() {
    var out ="", res = true;
    ExecuteCommand("node -v", out);
    try {
        out = StrToInt(RegexReplace(out, "[v\\.\\s]", "", false));
        if (out == 0) res = false;
    }
    except {
        res = false;
    }
    return res;
}

/**
 * Test if global NodeJS module is installed or not
 *
 * @param  string   module the name of the module to test for
 *
 * @return boolean
 */
function IsNodeJsModuleInstalled(module) {
    return DirectoryExists(ExpandEnvironmentStrings("%USERPROFILE%\\AppData\\Roaming\\npm\\node_modules\\" + module));
}

/**
 * Expands environment-variable strings and replaces them with the values defined for the current user.
 *
 * @param  string   str
 *
 * @return string
 */
function ExpandEnvironmentStrings(str) {
    var WSO = CreateOleObject("WScript.Shell");
    return WSO.ExpandEnvironmentStrings(str);
}

/**
 * Get DOS short path
 *
 * @param  string   path
 *
 * @return string
 */
function ShortPath(path) {
    if (DirectoryExists(path)) {
        var FSO = CreateOleObject("Scripting.FileSystemObject");
        var f = FSO.GetFolder(path);
        path = f.ShortPath;
    }
    return path;
}

/**
 * Open URL in default browser
 *
 * @param  string   url the url to open
 *
 * @return void
 */
function OpenUrlInBrowser(url) {
    var WSO = CreateOleObject("WScript.Shell");
    WSO.run(url);
}

/**
 * Copy one or more files from one location (the source) to another (destination).
 *
 * If source contains wildcard characters or destination ends with a path separator (\),
 * it is assumed that destination is an existing folder in which to copy matching files.
 * Otherwise, destination is assumed to be the name of a file to create. In either case,
 * three things can happen when an individual file is copied.
 * If destination does not exist, source gets copied. This is the usual case.
 * If destination is an existing file, an error occurs if overwrite is false. Otherwise,
 * an attempt is made to copy source over the existing file.
 * If destination is a directory, an error occurs.
 *
 * @param  string   source location of one or more files to be copied
 * @param  string   destination location to where one or more files in source will be copied
 * @param  bool     overwrite true allows the overwriting of existing files in the destination
 *
 * @return void
 */
function CopyFile(source, destination, overwrite) {
    var FSO = CreateOleObject("Scripting.FileSystemObject");
    if (FSO.FileExists(source)) {
        FSO.CopyFile(source, destination, overwrite);
    }
}

/**
 * Autoload gulpfile on project change
 *
 * @param  object   Sender
 *
 * @return void
 */
function OnAfterSelectProject(Sender) {
    if (CheckBox1.Checked == true) {
        var tmp = Lowercase(Script.ProjectSettings.SelectedProjectRoot) + "\\gulpfile.js";
        if (FileExists(tmp) == true) {
            KillAllRunningTasks();
            ComboBox1.Items.Insert(0, tmp); // Add to top of items list
            ComboBox1.ItemIndex = 0;
            SaveHistory(ComboBox1);
            LoadHistory(ComboBox1);
            var taskJson = GetGulpTasks(false);
            if (taskJson != "") {
                TreeView1.Items.Clear;
                AddTasks(TreeView1, ParseJson(taskJson), nil);
            }
        }
    }
}

/**
 * Toggle dock panel visibility
 *
 * @param  object   Sender
 *
 * @return void
 */
function ToggleDockPanel(Sender) {
    if (dockPanel.PanelVisible) {
        dockPanel.Close();
    }
    else {
        dockPanel.Show();
    }
}

/**
 * Remove object and resets it value to null
 *
 * @param  object   obj
 *
 * @return void
 */
function Nullify(obj) {
    if (obj != null) {
        delete obj;
    }
    return null;
}

/**
 * Signal triggered when plugin is disabled
 *
 * @return void
 */
function OnDisabled() {
    //save docking panel visibility so that we know whether to forecefully show panel when plugin is re-enabled
    var visibility = "0";
    if (dockPanel.PanelVisible) {
        visibility = "1";
    }
    Script.WriteSetting("Dock visible", visibility);
    dockPanel.Close();
}

/**
 * Signal triggered when exiting editor
 *
 * @return void
 */
function OnExit() {

    WebsocketSend("shutdown", "");

    // Cleanup
    DPSForm = Nullify(DPSForm);
    PSForm = Nullify(PSForm);
    scriptexec = Nullify(scriptexec);
}

/**
 * Signal triggered when editor is ready
 *
 * @return void
 */
function OnReady() {

    if (!ResourceCheck()) return;

    // Initialize Shell server
    WebsocketServerStart();

    // Initialize Websocket
    WebsocketInit();

    // If loading layouts eleminated this panel, the redock will restore it
    // this is important on the 1st run of the plugin
    dockPanel.ReDock();

    // restore dock visibility if dock enabled/disabled
    var visibility = Script.ReadSetting("Dock visible", "0");
    if (visibility == "1") {
        dockPanel.Show();
    }

}

/**
 * Signal triggered when plugin is installed through Plugin Manager.
 *
 * @return void
 */
function OnInstalled() {
    if (WeBuilder.BuildNumber < 194) {
        return "Newer editor version is required for this plugin to work";
    }
    Alert("Gulp Taskrunner 1.01 by Peter Klein installed sucessfully!");
}

Script.ConnectSignal("installed", "OnInstalled");

// Signals required for docks
dockPanel = CreateDock();
Script.ConnectSignal("ready", "OnReady");
Script.ConnectSignal("exit", "OnExit");
Script.ConnectSignal("disabled", "OnDisabled");

// Signal to detect change of Project
Script.ConnectSignal("project_after_select", "OnAfterSelectProject");

// Action for toggling dock
var bmp = new TBitmap, act;
LoadFileToBitmap(Script.Path + "images/gulp-icon.png", bmp);
act = Script.RegisterAction("", "Toggle Gulp panel", "", "ToggleDockPanel");
Actions.SetIcon(act, bmp);
delete bmp;