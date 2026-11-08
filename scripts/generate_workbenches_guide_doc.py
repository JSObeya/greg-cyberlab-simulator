import os
import sys
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, hex_color):
    shading_elm = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    cell._tc.get_or_add_tcPr().append(shading_elm)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('w:top', top), ('w:bottom', bottom), ('w:left', left), ('w:right', right)]:
        node = OxmlElement(m)
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_table_borders(table, color="CBD5E1", sz="4", val="single"):
    tblPr = table._tbl.tblPr
    tblBorders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'  <w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:left w:val="none"/>'
        f'  <w:right w:val="none"/>'
        f'  <w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:insideV w:val="none"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(tblBorders)

def add_header_footer(doc):
    for s in doc.sections:
        s.different_first_page_header_footer = True
        header = s.header
        hp = header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hrun = hp.add_run("RESTRICTED // NAVAL PROVOST CYBER LAB — WORKBENCHES MANUAL")
        hrun.font.name = "Arial"
        hrun.font.size = Pt(8.5)
        hrun.font.color.rgb = RGBColor(120, 130, 140)

        footer = s.footer
        fp = footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        frun = fp.add_run("6 Interactive Cyber Workbenches • Trainee Step-by-Step Operational Manual")
        frun.font.name = "Arial"
        frun.font.size = Pt(8.5)
        frun.font.color.rgb = RGBColor(120, 130, 140)

def create_workbenches_guide():
    doc = docx.Document()

    for section in doc.sections:
        section.top_margin = Inches(0.85)
        section.bottom_margin = Inches(0.85)
        section.left_margin = Inches(0.85)
        section.right_margin = Inches(0.85)

    add_header_footer(doc)

    # Color Palette
    NAVY = RGBColor(11, 37, 69)      # #0B2545
    STEEL = RGBColor(19, 64, 116)    # #134074
    GOLD = RGBColor(180, 130, 30)    # #B4821E
    CHARCOAL = RGBColor(33, 37, 41)  # #212529
    WHITE = RGBColor(255, 255, 255)
    MUTED = RGBColor(90, 100, 110)

    def h1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(18)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = 'Arial'
        run.font.size = Pt(15)
        run.font.bold = True
        run.font.color.rgb = NAVY
        return p

    def h2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(13)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = 'Arial'
        run.font.size = Pt(12.5)
        run.font.bold = True
        run.font.color.rgb = STEEL
        return p

    def h3(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(9)
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = 'Arial'
        run.font.size = Pt(10.5)
        run.font.bold = True
        run.font.color.rgb = CHARCOAL
        return p

    def para(text, bold_prefix="", italic=False):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(5)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            r_bold = p.add_run(bold_prefix)
            r_bold.font.name = 'Arial'
            r_bold.font.size = Pt(9.5)
            r_bold.font.bold = True
            r_bold.font.color.rgb = CHARCOAL
        run = p.add_run(text)
        run.font.name = 'Arial'
        run.font.size = Pt(9.5)
        run.font.italic = italic
        run.font.color.rgb = CHARCOAL
        return p

    def bullet(text, bold_prefix=""):
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            rb = p.add_run(bold_prefix)
            rb.font.name = 'Arial'
            rb.font.size = Pt(9.5)
            rb.font.bold = True
            rb.font.color.rgb = CHARCOAL
        run = p.add_run(text)
        run.font.name = 'Arial'
        run.font.size = Pt(9.5)
        run.font.color.rgb = CHARCOAL
        return p

    def callout(title, body, box_type="directive"):
        tbl = doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        tbl.autofit = False
        cell = tbl.cell(0, 0)
        cell.width = Inches(6.8)
        
        bg_color = "F0F4F8" if box_type == "directive" else "FFF8E1"
        border_color = "0B2545" if box_type == "directive" else "B4821E"
        set_cell_background(cell, bg_color)
        set_cell_margins(cell, top=130, bottom=130, left=170, right=170)
        
        tcPr = cell._tc.get_or_add_tcPr()
        tcBorders = parse_xml(
            f'<w:tcBorders {nsdecls("w")}>'
            f'  <w:left w:val="single" w:sz="24" w:space="0" w:color="{border_color}"/>'
            f'  <w:top w:val="none"/>'
            f'  <w:right w:val="none"/>'
            f'  <w:bottom w:val="none"/>'
            f'</w:tcBorders>'
        )
        tcPr.append(tcBorders)

        cp = cell.paragraphs[0]
        cp.paragraph_format.space_before = Pt(0)
        cp.paragraph_format.space_after = Pt(2)
        r_title = cp.add_run(f"[{title}] ")
        r_title.font.name = 'Arial'
        r_title.font.bold = True
        r_title.font.size = Pt(9.5)
        r_title.font.color.rgb = NAVY if box_type == "directive" else GOLD

        r_body = cp.add_run(body)
        r_body.font.name = 'Arial'
        r_body.font.size = Pt(9)
        r_body.font.color.rgb = CHARCOAL

        sp = doc.add_paragraph()
        sp.paragraph_format.space_before = Pt(2)
        sp.paragraph_format.space_after = Pt(3)

    def terminal_box(lines):
        tbl = doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        tbl.autofit = False
        cell = tbl.cell(0, 0)
        cell.width = Inches(6.8)
        set_cell_background(cell, "1E293B")
        set_cell_margins(cell, top=110, bottom=110, left=150, right=150)

        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.line_spacing = 1.1

        for i, line in enumerate(lines):
            if i > 0:
                p = cell.add_paragraph()
                p.paragraph_format.space_before = Pt(0)
                p.paragraph_format.space_after = Pt(0)
                p.paragraph_format.line_spacing = 1.1
            run = p.add_run(line)
            run.font.name = 'Courier New'
            run.font.size = Pt(8.5)
            if line.startswith("$") or line.startswith("#"):
                run.font.color.rgb = RGBColor(56, 189, 248)
                run.font.bold = True
            elif any(w in line for w in ["CRITICAL", "DENIED", "ALERT", "VULNERABLE", "REJECTED", "FAIL"]):
                run.font.color.rgb = RGBColor(248, 113, 113)
            elif any(w in line for w in ["OK", "PASSED", "VERIFIED", "ACCEPTED", "640"]):
                run.font.color.rgb = RGBColor(74, 222, 128)
            else:
                run.font.color.rgb = RGBColor(226, 232, 240)

        sp = doc.add_paragraph()
        sp.paragraph_format.space_before = Pt(2)
        sp.paragraph_format.space_after = Pt(3)

    def table_styled(headers, rows, widths=None):
        tbl = doc.add_table(rows=len(rows) + 1, cols=len(headers))
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        set_table_borders(tbl, color="CBD5E1")

        hdr_row = tbl.rows[0]
        for idx, h_text in enumerate(headers):
            cell = hdr_row.cells[idx]
            set_cell_background(cell, "0B2545")
            set_cell_margins(cell, top=90, bottom=90, left=110, right=110)
            if widths and idx < len(widths):
                cell.width = widths[idx]
            p = cell.paragraphs[0]
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(0)
            run = p.add_run(h_text)
            run.font.name = 'Arial'
            run.font.size = Pt(9)
            run.font.bold = True
            run.font.color.rgb = WHITE

        for r_idx, row_data in enumerate(rows):
            row = tbl.rows[r_idx + 1]
            bg = "F8FAFC" if r_idx % 2 == 1 else "FFFFFF"
            for c_idx, val in enumerate(row_data):
                cell = row.cells[c_idx]
                set_cell_background(cell, bg)
                set_cell_margins(cell, top=75, bottom=75, left=110, right=110)
                if widths and c_idx < len(widths):
                    cell.width = widths[c_idx]
                p = cell.paragraphs[0]
                p.paragraph_format.space_before = Pt(0)
                p.paragraph_format.space_after = Pt(0)
                run = p.add_run(str(val))
                run.font.name = 'Arial'
                run.font.size = Pt(8.5)
                run.font.color.rgb = CHARCOAL

        sp = doc.add_paragraph()
        sp.paragraph_format.space_before = Pt(2)
        sp.paragraph_format.space_after = Pt(3)

    # ==========================================
    # COVER / TITLE BLOCK
    # ==========================================
    p_badge = doc.add_paragraph()
    p_badge.paragraph_format.space_before = Pt(8)
    p_badge.paragraph_format.space_after = Pt(2)
    p_badge.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_badge = p_badge.add_run("NIGERIAN NAVAL PROVOST & MILITARY INTELLIGENCE CYBER ACADEMY")
    r_badge.font.name = 'Arial'
    r_badge.font.size = Pt(11)
    r_badge.font.bold = True
    r_badge.font.color.rgb = STEEL

    p_title = doc.add_paragraph()
    p_title.paragraph_format.space_before = Pt(4)
    p_title.paragraph_format.space_after = Pt(2)
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_title = p_title.add_run("6 INTERACTIVE CYBER WORKBENCHES: STEP-BY-STEP TRAINEE MANUAL")
    r_title.font.name = 'Arial'
    r_title.font.size = Pt(18)
    r_title.font.bold = True
    r_title.font.color.rgb = NAVY

    p_sub = doc.add_paragraph()
    p_sub.paragraph_format.space_before = Pt(2)
    p_sub.paragraph_format.space_after = Pt(12)
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_sub = p_sub.add_run("Course: Basic Cybersecurity and Artificial Intelligence for Security Personnel\nComprehensive Practical Guide to Operating All Virtual Workspaces")
    r_sub.font.name = 'Arial'
    r_sub.font.size = Pt(10.5)
    r_sub.font.color.rgb = MUTED

    meta_headers = ["Document Reference", "Duration / Track", "Target Trainees", "Security Classification"]
    meta_rows = [
        ["NP-WB-GUIDE-2026", "3 Weeks (Intensive Tactical Defense)", "Naval Provost & Military Intelligence Trainees", "RESTRICTED / TACTICAL CYBER DIRECTIVE"]
    ]
    table_styled(meta_headers, meta_rows, [Inches(1.6), Inches(1.8), Inches(1.8), Inches(1.6)])

    callout("TACTICAL TRAINING NOTICE",
            "This document provides mandatory operational steps for Naval Provost trainees utilizing the six specialized "
            "Interactive Cyber Workbenches in the Greg CyberLab Simulator. Each workbench simulates realistic military and enterprise "
            "cyber environments in complete isolation, enforcing evidence preservation, strict least privilege, and sound OPSEC principles.",
            box_type="directive")

    # ==========================================
    # SECTION 1: ARCHITECTURE & WORKBENCHES TAXONOMY
    # ==========================================
    h1("1. Architectural Overview of the 6 Cyber Workbenches")
    para("The Greg CyberLab Simulator features six purpose-built interactive workspaces. Each workspace provides targeted instrumentation "
         "for specific defensive cyber competencies, from terminal command execution to high-level SIEM alert triage:")

    table_styled(
        ["#", "Interactive Cyber Workbench", "Workspace Code", "Primary Tactical Competencies", "Sample Laboratories"],
        [
            ["1", "Simulated Kali Terminal", "kali_terminal", "POSIX commands, permission hardening (chmod 640), process killing, IP isolation, SHA-256 evidence hashing.", "NP-LAB 01, 02, 05, 08, 10, 11"],
            ["2", "Phishing Analysis Workbench", "phishing_analyzer", "SMTP email header parsing, SPF/DKIM verification, domain typosquatting detection, credential harvest triage.", "Lab 04, Phishing Triage"],
            ["3", "Log Forensics Workbench", "log_auditor", "Auth log parsing (/var/log/auth.log), brute force & password spray correlation, attacker IP extraction.", "Lab 11, NP-LAB 10 Spraying"],
            ["4", "Packet Metadata Inspector", "packet_inspector", "PCAP frame analysis, TCP 3-way handshake, unencrypted credential leak discovery, protocol decoding.", "Lab 12, Packet Forensics"],
            ["5", "SOC Alert Queue & SIEM Center", "soc_queue", "Active SIEM triage, severity classification, host isolation, NIST SP 800-61 containment protocols.", "Lab 15, SOC Center, NP-LAB 08"],
            ["6", "General Tactical Workbench", "general_workbench", "4-factor taxonomy matrix, 4-word passphrase generation, tabletop triage (Operation Secure Access).", "NP-LAB 03, 06, 07, 09, 12"]
        ],
        [Inches(0.4), Inches(1.8), Inches(1.3), Inches(2.2), Inches(1.1)]
    )

    para("Trainees can switch seamlessly between the Scenario Briefing, Interactive Workbench, Kali Terminal, and Assessment submission "
         "tabs using the workspace navigation bar at the top of the Simulation Arena.")

    # ==========================================
    # SECTION 2: WORKBENCH 1 — KALI TERMINAL
    # ==========================================
    h1("2. Workbench 1: Simulated Kali Linux Terminal")
    h2("2.1 Tactical Mission & Purpose")
    para("The Simulated Kali Terminal provides an AST allow-listed Linux command shell operating on an isolated virtual filesystem. "
         "It trains military watchstanders to navigate system directories, audit permissions, terminate rogue SSH connections, filter logs, "
         "and compute legally admissible evidence hashes without exposing production host operating systems.")

    h2("2.2 Interface Controls & Shell Anatomy")
    bullet(" Shows cadet username, simulated hostname, and current directory path (e.g. cadet@naval-provost:~$ ).", "Shell Prompt: ")
    bullet(" Retains previous commands and server responses with syntax highlighting.", "Terminal Output Buffer: ")
    bullet(" Enter standard Linux commands and press Return/Enter to execute.", "Command Input Field: ")
    bullet(" Located in the top header; launches the cryptographic decoder and cipher analysis tool in an overlay drawer.", "CyberChef Assistant: ")

    h2("2.3 Allow-Listed Command Reference")
    table_styled(
        ["Command", "Allow-Listed Syntax Example", "Operational Military Purpose"],
        [
            ["cat", "cat /srv/audit/flagged_passwords.txt", "Display full contents of configuration or audit log files."],
            ["grep", "grep -i 'NavyMarch2026!' /var/log/auth.log", "Search files for attack signatures, IP addresses, or strings."],
            ["awk", "awk '{print $1, $5}' /var/log/access.log", "Extract specific columns from structured access logs."],
            ["chmod", "sudo chmod 640 /data/intel_ops/sea_guard.dat", "Enforce least-privilege permissions (Read/Write owner, Read group, None others)."],
            ["chown", "sudo chown root:provost_intel file.db", "Set ownership to root and provost tactical intelligence group."],
            ["kill / pkill", "sudo kill -9 29014", "Forcibly terminate active rogue processes or unauthorized SSH sessions."],
            ["sha256sum", "sha256sum /var/log/provost_armory.log", "Calculate cryptographic SHA-256 hash to ensure evidence chain of custody."],
            ["iptables", "sudo iptables -A INPUT -s 185.220.101.5 -j DROP", "Apply defensive packet-filter firewall rule to isolate hostile IPs."]
        ],
        [Inches(1.1), Inches(2.7), Inches(3.0)]
    )

    h2("2.4 Step-by-Step Trainee Execution Procedure")
    bullet(" Launch the terminal by clicking the 'Kali Terminal' tab in the Simulation Arena.", "Step 1 - Initialize Session: ")
    bullet(" Check environment status by typing `sys-info` and viewing allow-listed commands with `help`.", "Step 2 - Environment Verification: ")
    bullet(" Inspect files in the current working directory using `ls -la` to check permissions, ownership, and hidden files.", "Step 3 - Directory Navigation: ")
    bullet(" Remediate overly permissive files (e.g., chmod 777) by issuing `chmod 640 <filename>`.", "Step 4 - Apply Hardening: ")
    bullet(" Check for hostile active sessions using `who -u` or `ps aux`. Identify the hostile PID and terminate with `kill -9 <PID>`.", "Step 5 - Terminate Intrusion: ")
    bullet(" Generate cryptographic integrity hash with `sha256sum <logfile>` and record the output in the assessment tab.", "Step 6 - Evidence Preservation: ")

    terminal_box([
        "$ sys-info",
        "=== GREG CYBERLAB SIMULATED KALI TERMINAL ===",
        "Security Mode: Isolated Virtual POSIX Environment",
        "Target Node: 10.20.0.45 (Provost Secure Gateway)",
        "",
        "$ ls -la /srv/provost_armory/",
        "-rwxrwxrwx 1 root root 14800 Mar 28 02:12 arms_inventory.db  [ALERT: WORLD-WRITABLE]",
        "",
        "$ sudo chmod 640 /srv/provost_armory/arms_inventory.db",
        "$ ls -la /srv/provost_armory/",
        "-rw-r----- 1 root provost_officers 14800 Mar 28 02:12 arms_inventory.db  [OK: HARDENED]",
        "",
        "$ sha256sum /srv/provost_armory/arms_inventory.db",
        "c89a01f56b21...arms_inventory.db  [CHAIN OF CUSTODY HASH RECORDED]"
    ])

    # ==========================================
    # SECTION 3: WORKBENCH 2 — PHISHING ANALYSIS
    # ==========================================
    h1("3. Workbench 2: Phishing Analysis Workbench")
    h2("3.1 Tactical Mission & Purpose")
    para("Adversaries frequently employ spear-phishing and display-name spoofing to trick naval personnel into surrendering credentials or "
         "executing malware. This workbench provides a safe, interactive email triage client that isolates malicious dispatches, allows deep header "
         "inspection, and evaluates Sender Policy Framework (SPF) and DKIM cryptographic records with zero risk of malware execution.")

    h2("3.2 Anatomy of the Email Triage Client")
    bullet(" Shows incoming unread dispatches categorized by sender, subject line, and date.", "Triage Inbox: ")
    bullet(" Reveals MTA transmission hops, originating IP addresses, Return-Path, and envelope headers.", "Raw Header Inspector: ")
    bullet(" Visual indicators highlighting whether the sending server was authorized (PASS, FAIL, SOFTFAIL).", "SPF & DKIM Status Badges: ")
    bullet(" Renders the message content with safe non-functional link placeholders and attachment alerts.", "Sanitized Message Preview: ")

    h2("3.3 Step-by-Step Trainee Execution Procedure")
    bullet(" Select a message from the queue and click 'Inspect Headers'.", "Step 1 - Open Triage Client: ")
    bullet(" Compare the visible 'From:' display name against the actual 'Return-Path:' and 'Reply-To:' addresses. Note discrepancies.", "Step 2 - Verify Sender Alignment: ")
    bullet(" Inspect the 'Authentication-Results' header. Check if SPF is FAIL or SOFTFAIL (indicating unauthorized IP sending on behalf of domain).", "Step 3 - Evaluate SPF/DKIM: ")
    bullet(" Examine hyperlinks by hovering or viewing link destinations in the inspector. Check for typosquatting (e.g., navy-logistics.xyz vs navy.mil.ng).", "Step 4 - Inspect Hyperlinks: ")
    bullet(" Classify the email as Benign, Phishing, or Spear-Phishing based on indicators.", "Step 5 - Formulate Classification: ")
    bullet(" Copy the originating hostile IP and domain into the Provost Phishing Bulletin in the Assessment tab.", "Step 6 - Submit Finding: ")

    terminal_box([
        "HEADER INSPECTION TRACE:",
        "From: Naval Welfare Promotion Board <admiral.office@navy-portal.xyz>",
        "Reply-To: credential-harvest@external-host.net  [ALERT: MISMATCH]",
        "Received: from mail.foreign-relay.org (194.26.29.55)",
        "Authentication-Results: spf=fail (sender IP not authorized in SPF record of navy.mil.ng)",
        "DKIM-Signature: NONE (Missing Cryptographic Signature)",
        "Link Target: http://194.26.29.55/login.php?user=target  [UNENCRYPTED CREDENTIAL PROBE]",
        "----------------------------------------------------------------",
        "[VERDICT]: CONFIRMED SPEAR-PHISHING CAMPAIGN TARGETING NAVAL RATINGS"
    ])

    # ==========================================
    # SECTION 4: WORKBENCH 3 — LOG FORENSICS
    # ==========================================
    h1("4. Workbench 3: Log Forensics Workbench")
    h2("4.1 Tactical Mission & Purpose")
    para("Security monitoring requires identifying threat actor footprints buried within thousands of routine system events. "
         "The Log Forensics Workbench enables trainees to filter authentication logs (`/var/log/auth.log`) and web access records, "
         "detect horizontal password spraying, isolate hostile IP addresses, and document attack timelines.")

    h2("4.2 Step-by-Step Trainee Execution Procedure")
    bullet(" Open the Log Forensics tab. Select the target log source (`/var/log/auth.log` or `/var/log/nginx/access.log`).", "Step 1 - Select Log Stream: ")
    bullet(" Filter for failed logins using the search bar: `Failed password` or search pattern `185.220.101.5`.", "Step 2 - Search & Filter: ")
    bullet(" Look for horizontal spray patterns: multiple distinct usernames targeted with the exact same timestamp and password guess.", "Step 3 - Pattern Correlation: ")
    bullet(" Note any `Accepted password` lines from the same hostile IP to determine if any account was successfully breached.", "Step 4 - Breach Identification: ")
    bullet(" Record the breached account name, the attacking IP, and the total attack duration in minutes.", "Step 5 - Timeline Construction: ")
    bullet(" Issue firewall drop rules and submit the hostile IP to the assessment report.", "Step 6 - Defensive Containment: ")

    terminal_box([
        "$ grep 'Failed password' /var/log/auth.log | head -n 5",
        "Mar 28 03:01:10 base-srv sshd[14102]: Failed password for cadet01 from 185.220.101.5 port 44321",
        "Mar 28 03:01:14 base-srv sshd[14108]: Failed password for cadet02 from 185.220.101.5 port 44322",
        "Mar 28 03:01:18 base-srv sshd[14114]: Failed password for rating_desk from 185.220.101.5 port 44323",
        "",
        "$ grep 'Accepted password' /var/log/auth.log",
        "Mar 28 03:01:26 base-srv sshd[14126]: Accepted password for supply_clerk from 185.220.101.5 port 44325",
        "[BREACH DETECTED]: Account 'supply_clerk' compromised at 03:01:26 hrs!"
    ])

    # ==========================================
    # SECTION 5: WORKBENCH 4 — PACKET INSPECTOR
    # ==========================================
    h1("5. Workbench 4: Packet Metadata Inspector")
    h2("5.1 Tactical Mission & Purpose")
    para("Network traffic carries unvarnished truth regarding adversary lateral movement and data exfiltration. "
         "The Packet Metadata Inspector provides a structured Wireshark-style protocol decoder, visualizing frame sequences, "
         "IP packet headers, TCP flags, and ASCII/Hex payload contents.")

    h2("5.2 Step-by-Step Trainee Execution Procedure")
    bullet(" Review captured packet frames in the grid. Columns display Frame No, Time Offset, Source IP, Destination IP, Protocol, and Length.", "Step 1 - Ingest Capture: ")
    bullet(" Filter for cleartext protocols by typing `TELNET`, `HTTP`, or `FTP` into the protocol filter bar.", "Step 2 - Protocol Filtering: ")
    bullet(" Click on individual frame rows to expand the layer breakdown (Ethernet II -> IPv4 -> TCP -> Application Layer).", "Step 3 - Layer Breakdown: ")
    bullet(" In the ASCII Payload Viewer, look for cleartext login sequences (e.g. `User: admin`, `Pass: Armory2026!`).", "Step 4 - Credential Extraction: ")
    bullet(" Differentiate encrypted SSH/HTTPS traffic (garbled cipher text) from unencrypted Telnet/HTTP traffic.", "Step 5 - Encryption Verification: ")
    bullet(" Document the exposed credentials and recommend port deactivation in the Assessment submission.", "Step 6 - Policy Recommendation: ")

    terminal_box([
        "PACKET FRAME #104 DECODE TRACE:",
        "Frame 104: 86 bytes on wire (688 bits), 86 bytes captured on interface eth0",
        "Internet Protocol Version 4, Src: 10.20.0.45, Dst: 10.20.0.99",
        "Transmission Control Protocol, Src Port: 51240, Dst Port: 23 (Telnet)",
        "Telnet Payload (ASCII):",
        "0000  70 61 73 73 77 6f 72 64 3a 20 4e 61 76 79 32 30  password: Navy20",
        "0010  32 36 21 0d 0a                                    26!..",
        "[CRITICAL FINDING]: Telnet Port 23 exposed plaintext military password on LAN!"
    ])

    # ==========================================
    # SECTION 6: WORKBENCH 5 — SIEM SOC CENTER
    # ==========================================
    h1("6. Workbench 5: SOC Alert Queue & SIEM Incident Center")
    h2("6.1 Tactical Mission & Purpose")
    para("Security Operations Centers (SOC) require rapid triage to prevent alert fatigue. The SIEM Incident Center provides "
         "real-time simulated security events, enabling trainees to apply the NIST SP 800-61 Computer Security Incident Handling standard "
         "to triage, isolate compromised hosts, and document remediation.")

    h2("6.2 Step-by-Step Trainee Execution Procedure")
    bullet(" View the Active SIEM Alert Queue. Sort alerts by severity (Critical, High, Medium, Low).", "Step 1 - Monitor Queue: ")
    bullet(" Click on a Critical alert to inspect the impacted asset, user identity, and threat telemetry.", "Step 2 - Inspect Telemetry: ")
    bullet(" Determine whether the alert is a True Positive (malicious intrusion) or False Positive (authorized routine maintenance).", "Step 3 - Validate Indicator: ")
    bullet(" If True Positive, click the 'Isolate Impacted Host' action button to sever network connectivity and prevent lateral spread.", "Step 4 - Containment Execution: ")
    bullet(" Click 'Lock User Account' to immediately revoke active Kerberos/LDAP tokens for the breached identity.", "Step 5 - Credential Revocation: ")
    bullet(" Fill out the SOC Triage Dispatch form with findings, containment actions, and evidence hashes.", "Step 6 - File Incident Dispatch: ")

    terminal_box([
        "SIEM INCIDENT CENTER — ALERT DETAIL:",
        "Alert ID: SOC-2026-9041 | Severity: CRITICAL",
        "Asset Impacted: svr-naval-armory.base.mil (10.20.0.99)",
        "User Account: admin_watch (Privileged Admin)",
        "Detection Rule: High-Volume Credential Injection & External Session Anomaly",
        "Source IP: 194.26.29.112 (Foreign Autonomous System ASN-41029)",
        "----------------------------------------------------------------",
        "ACTION TAKEN BY WATCHSTANDER:",
        "[X] Network Isolation Applied to 10.20.0.99",
        "[X] Account 'admin_watch' Locked in Active Directory",
        "[X] Escalation Signal Dispatched to Provost Marshal"
    ])

    # ==========================================
    # SECTION 7: WORKBENCH 6 — GENERAL WORKBENCH
    # ==========================================
    h1("7. Workbench 6: General Tactical & Security Workbench")
    h2("7.1 Tactical Mission & Purpose")
    para("The General Tactical Workbench provides an interactive clinic environment for multi-factor authentication, "
         "passphrase entropy calculation, access control policy modeling (DAC/MAC/RBAC/ABAC), and tabletop incident simulations.")

    h2("7.2 Interactive Components & Tools")
    bullet(" Categorize access mechanisms into Know, Have, Are, and Context.", "Factor Taxonomy Matrix: ")
    bullet(" Tests candidate 4-word passphrases against crack-time calculators, evaluating entropy in bits.", "Passphrase Generator & Entropy Meter: ")
    bullet(" Simulates unannounced third-party visitor requests and server room mantrap tailgating alerts.", "Visitor & Physical Mantrap Console: ")
    bullet(" Walk through multi-incident scenarios (e.g. Operation Secure Access) with prioritized response buttons.", "Tabletop Incident Timeline Board: ")

    h2("7.3 Step-by-Step Trainee Execution Procedure")
    bullet(" Open the General Workbench tab in the Simulation Arena.", "Step 1 - Access Workbench: ")
    bullet(" Audit candidate passwords (e.g., naval123, Musa2026) using the Entropy Meter. Note crack times in seconds.", "Step 2 - Password Audit: ")
    bullet(" Generate a compliant 4-word passphrase exceeding 16 characters (e.g., 'anchor-falcon-granite-whistle'). Verify entropy >75 bits.", "Step 3 - Passphrase Generation: ")
    bullet(" In the Factor Taxonomy widget, drag each artifact to its correct factor category (CAC Card -> Have, PIN -> Know, Iris -> Are, Shift Hours -> Context).", "Step 4 - Factor Classification: ")
    bullet(" Triage incoming MFA fatigue push notifications: select 'DENY & REPORT IMMEDIATELY'.", "Step 5 - Push-Bombing Defense: ")
    bullet(" Review tabletop events, order them by severity, and complete the official Naval Provost Incident Report Worksheet.", "Step 6 - Incident Response: ")

    # ==========================================
    # SECTION 8: CYBERCHEF DECODER INTEGRATION
    # ==========================================
    h1("8. Integrated CyberChef Decoding Assistant")
    para("The CyberChef drawer is built directly into the Simulation Arena header. It allows watchstanders to decode obfuscated "
         "adversary payloads, unmask base64-encoded command strings, and compute cryptographic hashes on the fly:")

    table_styled(
        ["Adversary Obfuscation Technique", "Recommended CyberChef Recipe", "Practical Military Application"],
        [
            ["Base64 Encoded PowerShell", "From Base64 -> Remove Null Bytes", "De-obfuscate hidden commands executed in terminal logs."],
            ["URL-Encoded Web Exploit", "URL Decode", "Reveal SQL injection or directory traversal parameters in access logs."],
            ["Hex-Encoded Payload String", "From Hex", "Convert raw PCAP frame payload hex bytes into readable ASCII text."],
            ["Cryptographic Checksum", "SHA256 / MD5", "Verify downloaded file integrity and compare against known malware hashes."]
        ],
        [Inches(2.0), Inches(2.2), Inches(2.6)]
    )

    # ==========================================
    # SECTION 9: ASSESSMENT RUBRIC & CHECKLIST
    # ==========================================
    h1("9. Trainee Evaluation Rubric & Sign-Off Checklist")
    para("Every trainee must achieve a minimum score of 75% across all workbench exercises. Evaluations are conducted against the following rubric:")

    table_styled(
        ["Rubric Dimension", "Weight", "Mastery Criteria"],
        [
            ["Workbench Tool Proficiency", "35%", "Flawless operation of terminal, log filters, PCAP decoders, and SIEM consoles."],
            ["Threat Detection & Analysis", "30%", "Accurate identification of attacks (password spraying, phishing, cleartext leaks)."],
            ["Defensive Containment", "20%", "Prompt execution of least-privilege permissions, host isolation, and session termination."],
            ["Documentation & Chain of Custody", "15%", "Complete incident report worksheets, accurate timestamps, and SHA-256 evidence hashes."]
        ],
        [Inches(2.0), Inches(1.1), Inches(3.7)]
    )

    output_paths = [
        r"c:\laragon\www\greg-cyberlab-simulator\public\downloads\Navy_Trainee_Guide_6_Interactive_Cyber_Workbenches.docx",
        r"c:\laragon\www\greg-cyberlab-simulator\Navy_Trainee_Guide_6_Interactive_Cyber_Workbenches.docx",
        r"C:\Users\Engr.J.S.Obeya\.gemini\antigravity\brain\1cc0ed7e-1f99-4b8e-b12a-79656df7f7d0\Navy_Trainee_Guide_6_Interactive_Cyber_Workbenches.docx"
    ]

    for p in output_paths:
        try:
            os.makedirs(os.path.dirname(p), exist_ok=True)
            doc.save(p)
            print(f"Generated workbenches guide at: {p}")
        except Exception as e:
            print(f"Error saving {p}: {e}")

if __name__ == "__main__":
    create_workbenches_guide()

