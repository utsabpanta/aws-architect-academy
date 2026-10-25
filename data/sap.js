window.TRACKS = window.TRACKS || {};
window.TRACKS.sap = {
  id: 'sap',
  code: 'SAP-C02',
  name: 'Solutions Architect – Professional',
  tagline: `Architect multi-account, hybrid, multi-Region AWS estates and migrate them at scale, the way a principal architect would.`,
  exam: { questions: 75, minutes: 180, passing: 750, scale: '100–1000', cost: '300 USD', format: 'Multiple choice and multiple response' },
  domains: [
    // =====================================================================
    // DOMAIN 1 — ORGANIZATIONAL COMPLEXITY
    // =====================================================================
    {
      id: 'org',
      name: 'Design Solutions for Organizational Complexity',
      weight: 26,
      summary: `Govern many accounts with Organizations and Control Tower, layer guardrails correctly, and connect VPCs and data centers through resilient, segmented, centrally inspected networks.`,
      lessons: [
        {
          id: 'p-multi-account-strategy',
          title: 'Multi-Account Strategy with Organizations & Control Tower',
          minutes: 15,
          summary: `Design an OU hierarchy, a governed landing zone, and a delegated-administrator model that keeps the management account nearly empty.`,
          sections: [
            {
              heading: 'Why accounts are the unit of isolation',
              html: `<p>An AWS account is the strongest isolation boundary you can buy without paying for anything: it is a hard boundary for IAM, for service quotas, for billing attribution and for blast radius. At professional level the question is never <em>whether</em> to use multiple accounts but <strong>how to group them</strong> so that policy, ownership and cost line up.</p>
<ul>
<li><strong>Security boundary</strong> – a compromised credential in a sandbox account cannot touch production unless you explicitly built a trust path.</li>
<li><strong>Quota boundary</strong> – one noisy team cannot exhaust another team's Lambda concurrency or EC2 limits.</li>
<li><strong>Billing boundary</strong> – cost is attributed per account automatically, with no tagging discipline required.</li>
<li><strong>Change boundary</strong> – you can apply a different set of guardrails to each OU.</li>
</ul>
<div class="callout">Group accounts by <strong>function and policy need</strong> (security, infrastructure, workloads by SDLC stage), not by the company org chart. Org charts change every reorg; control requirements change rarely.</div>`
            },
            {
              heading: 'A reference OU structure',
              html: `<p>The AWS multi-account guidance converges on a small number of foundational OUs. Policies attach to OUs, so the hierarchy is really a <strong>policy inheritance tree</strong>.</p>
<table><thead><tr><th>OU</th><th>Typical accounts</th><th>Guardrail posture</th></tr></thead><tbody>
<tr><td>Security</td><td>Log Archive, Security Tooling / Audit</td><td>Very restrictive; only the security team; immutable logs</td></tr>
<tr><td>Infrastructure</td><td>Network hub, shared services (DNS, directory, CI tooling)</td><td>Restrictive; network team owns TGW, DX, egress</td></tr>
<tr><td>Workloads (Prod / Non-Prod)</td><td>One or more accounts per application per stage</td><td>Prod tighter than non-prod (Region lock, no IGW creation, encryption required)</td></tr>
<tr><td>Sandbox</td><td>Individual developer accounts</td><td>Disconnected from the corporate network; budget-capped</td></tr>
<tr><td>Policy Staging</td><td>Test accounts for new SCPs/RCPs</td><td>Where you trial guardrails before promoting them</td></tr>
<tr><td>Suspended</td><td>Accounts pending closure</td><td>Deny-all SCP</td></tr>
</tbody></table>
<p>Keep the <strong>management account</strong> for Organizations, billing and little else. SCPs and RCPs never restrict the management account, so anything running there is outside your guardrails.</p>`
            },
            {
              heading: 'AWS Control Tower: a governed landing zone',
              html: `<p>Control Tower orchestrates Organizations, IAM Identity Center, CloudTrail, AWS Config, and CloudFormation StackSets into an opinionated <strong>landing zone</strong>. It creates the Security OU with a Log Archive and an Audit account, an organization-level CloudTrail, and Config recording in governed Regions.</p>
<table><thead><tr><th>Control behavior</th><th>Implemented with</th><th>When it acts</th></tr></thead><tbody>
<tr><td>Preventive</td><td>SCPs (and RCPs)</td><td>Blocks the API call before it happens</td></tr>
<tr><td>Detective</td><td>AWS Config rules</td><td>Flags noncompliant resources after creation</td></tr>
<tr><td>Proactive</td><td>CloudFormation Hooks</td><td>Rejects noncompliant resources during a CloudFormation deployment</td></tr>
</tbody></table>
<ul>
<li><strong>Account Factory</strong> vends new accounts with baseline networking and enrollment into an OU (via Service Catalog).</li>
<li><strong>Account Factory for Terraform (AFT)</strong> provides a GitOps pipeline for account requests and per-account customizations in Terraform.</li>
<li><strong>Customizations for Control Tower (CfCT)</strong> deploys your own CloudFormation templates and SCPs on lifecycle events, using StackSets.</li>
<li><strong>Drift detection</strong> reports when someone changes Control Tower-managed resources out of band (for example, moving an account between OUs directly in Organizations).</li>
</ul>
<div class="callout warn">A common trap: editing Control Tower-managed SCPs or the managed StackSets directly. That causes drift. Add your own controls alongside, or through CfCT/AFT, and repair drift by re-registering the OU or updating the landing zone.</div>`
            },
            {
              heading: 'Delegated administration',
              html: `<p>Most security and governance services integrate with Organizations and support a <strong>delegated administrator</strong> member account. This lets the security team operate org-wide without ever logging in to the management account.</p>
<ul>
<li>Security Tooling account as delegated admin for <strong>GuardDuty, Security Hub, Amazon Inspector, Macie, Detective, IAM Access Analyzer, Firewall Manager, AWS Config (aggregators)</strong>.</li>
<li>A shared-services or deployment account as delegated admin for <strong>CloudFormation StackSets</strong> (service-managed permissions) and <strong>AWS Backup</strong> policies.</li>
<li>An identity account as delegated admin for <strong>IAM Identity Center</strong> (you still cannot manage permission sets that are provisioned into the management account from the delegated admin).</li>
</ul>
<p>Combine delegated admin with <strong>auto-enable</strong> settings (for example, GuardDuty auto-enable for new member accounts) so newly vended accounts are covered from the first minute.</p>`
            },
            {
              heading: 'Reference scenario',
              html: `<p><strong>Scenario:</strong> a bank acquires three subsidiaries, each with a dozen standalone accounts. Requirements: central audit logs that subsidiaries cannot delete, a single bill with discount sharing, and the ability to apply stricter controls to regulated workloads.</p>
<ul>
<li>Invite the subsidiary accounts into the bank's organization (an account can belong to only one organization at a time; each must leave its old org first).</li>
<li>Enroll them into Control Tower under <code>Workloads/Regulated</code> and <code>Workloads/Standard</code> OUs; Control Tower adds the org trail and Config baseline.</li>
<li>Deliver CloudTrail and Config to the Log Archive account bucket with S3 Object Lock and a bucket policy that denies deletes; deny <code>cloudtrail:StopLogging</code> and <code>cloudtrail:DeleteTrail</code> via SCP.</li>
<li>Make the Security Tooling account delegated admin for GuardDuty and Security Hub; aggregate findings into one home Region.</li>
</ul>`
            }
          ],
          keyPoints: [
            `Accounts are the strongest isolation boundary for IAM, quotas, billing and blast radius.`,
            `Design OUs around policy needs (Security, Infrastructure, Workloads, Sandbox, Suspended), not the org chart.`,
            `SCPs and RCPs never apply to the management account, so keep workloads out of it.`,
            `Control Tower controls are preventive (SCP/RCP), detective (Config) or proactive (CloudFormation Hooks).`,
            `Use AFT or CfCT for customizations instead of editing Control Tower-managed resources, to avoid drift.`,
            `Delegate administration of security services to a Security Tooling account and turn on auto-enable.`
          ],
          examTips: [
            `If the question says "govern new accounts automatically with minimal operational overhead", think Control Tower Account Factory (or AFT if they mention Terraform).`,
            `If the requirement is "block noncompliant resources before they are created by CloudFormation", think proactive controls (CloudFormation Hooks), not Config rules.`,
            `If a solution runs workloads in the management account to "simplify" access, it is almost always wrong because SCPs do not protect it.`,
            `If the question mentions "without using the management account", look for delegated administrator.`
          ],
          services: ['AWS Organizations', 'AWS Control Tower', 'AWS Config', 'AWS CloudTrail', 'AWS Service Catalog', 'AWS CloudFormation StackSets']
        },
        {
          id: 'p-access-control-at-scale',
          title: 'SCPs vs RCPs vs IAM Policies, Identity Center & Cross-Account Access',
          minutes: 18,
          summary: `Know exactly how each policy type participates in authorization, build a data perimeter, and give humans and workloads cross-account access safely.`,
          sections: [
            {
              heading: 'How the policy types combine',
              html: `<p>Every request is evaluated against all applicable policies. An <strong>explicit deny anywhere wins</strong>. For an allow, the request must be permitted by every applicable guardrail <em>and</em> granted by an identity or resource policy.</p>
<table><thead><tr><th>Policy type</th><th>Attached to</th><th>Grants?</th><th>What it limits</th></tr></thead><tbody>
<tr><td>SCP</td><td>Root, OU or account</td><td>No – maximum available permissions</td><td><strong>Principals</strong> (IAM users and roles, including the member account root user) in member accounts</td></tr>
<tr><td>RCP</td><td>Root, OU or account</td><td>No – maximum available permissions</td><td><strong>Resources</strong> in member accounts, for supported services (for example S3, STS, KMS, SQS, Secrets Manager), regardless of who is calling</td></tr>
<tr><td>Permissions boundary</td><td>IAM user or role</td><td>No</td><td>The maximum an identity policy can grant that principal</td></tr>
<tr><td>Identity policy</td><td>User, group, role</td><td>Yes</td><td>—</td></tr>
<tr><td>Resource policy</td><td>Bucket, key, queue, role trust…</td><td>Yes</td><td>—</td></tr>
<tr><td>Session policy</td><td>AssumeRole / federation session</td><td>No</td><td>Further scopes a session</td></tr>
</tbody></table>
<ul>
<li>SCPs and RCPs do <strong>not</strong> affect service-linked roles and never affect the management account.</li>
<li>An SCP cannot stop an <em>external</em> principal from reaching your bucket – the external principal is not in your org. That gap is exactly what <strong>RCPs</strong> close.</li>
<li>Cross-account access requires an allow in the caller's identity policy <strong>and</strong> in the target's resource policy (or role trust policy).</li>
</ul>`
            },
            {
              heading: 'Building a data perimeter',
              html: `<p>A data perimeter ensures that <strong>only trusted identities</strong> access <strong>trusted resources</strong> from <strong>expected networks</strong>. Each leg maps to a policy type and a global condition key.</p>
<table><thead><tr><th>Perimeter goal</th><th>Policy type</th><th>Key condition</th></tr></thead><tbody>
<tr><td>Only my org's identities reach my resources</td><td>RCP (or resource policies)</td><td><code>aws:PrincipalOrgID</code></td></tr>
<tr><td>My identities only reach my org's resources</td><td>SCP</td><td><code>aws:ResourceOrgID</code></td></tr>
<tr><td>Access only from my networks</td><td>RCP / SCP / endpoint policy</td><td><code>aws:SourceVpce</code>, <code>aws:SourceIp</code>, <code>aws:ViaAWSService</code></td></tr>
</tbody></table>
<p>Use <code>aws:PrincipalIsAWSService</code> and <code>aws:SourceOrgID</code> exceptions so that AWS services acting on your behalf (CloudTrail writing logs, for example) are not broken.</p>
<div class="callout warn">Deny-based SCPs and RCPs are powerful and fail closed. Always trial them in a Policy Staging OU and use IAM Access Analyzer and CloudTrail to find legitimate access you would break.</div>`
            },
            {
              heading: 'Human access: IAM Identity Center',
              html: `<p>IAM Identity Center is the recommended way to give workforce users access to many accounts. Connect an external IdP (Microsoft Entra ID, Okta, and others) using <strong>SAML 2.0 for authentication and SCIM for automatic user/group provisioning</strong>, or connect AWS Managed Microsoft AD / AD Connector.</p>
<ul>
<li><strong>Permission sets</strong> are templates; assigning a group + permission set to an account provisions an IAM role (<code>AWSReservedSSO_...</code>) in that account.</li>
<li>Use <strong>attribute-based access control (ABAC)</strong> by passing IdP attributes (cost center, project) as session tags, then match <code>aws:PrincipalTag</code> to <code>aws:ResourceTag</code>. This scales far better than one permission set per project.</li>
<li>Short-lived credentials for the CLI via <code>aws sso login</code> remove long-term access keys.</li>
</ul>`
            },
            {
              heading: 'Workload access: cross-account roles, resource policies and RAM',
              html: `<p><strong>Cross-account IAM roles</strong>: the trusting account creates a role whose trust policy names the trusted account or role; the trusted principal calls <code>sts:AssumeRole</code>. For third parties (SaaS vendors) require an <code>sts:ExternalId</code> condition to prevent the <strong>confused deputy</strong> problem.</p>
<p><strong>Resource policies</strong> (S3, KMS, SQS, SNS, Lambda, Secrets Manager, ECR, EventBridge buses) let a principal use the resource without switching roles, which preserves the caller's own identity and permissions. For KMS, the key policy is mandatory: without it allowing the external account, no IAM policy can grant use.</p>
<p><strong>AWS Resource Access Manager (RAM)</strong> shares resources that do not have resource policies, such as VPC subnets (VPC sharing), Transit Gateways, Route 53 Resolver rules, prefix lists, IPAM pools, License Manager configurations and Network Firewall policies. With sharing enabled for Organizations, shares to OUs need no invitation acceptance.</p>
<table><thead><tr><th>Need</th><th>Best fit</th></tr></thead><tbody>
<tr><td>Many app accounts deploy into centrally managed subnets</td><td>VPC sharing via RAM</td></tr>
<tr><td>Central CI pipeline deploys into 200 accounts</td><td>Cross-account role assumed by the pipeline, or StackSets</td></tr>
<tr><td>Analytics account reads another account's S3 data</td><td>Bucket policy (+ KMS key policy if SSE-KMS)</td></tr>
<tr><td>Vendor monitors your account</td><td>Role with ExternalId condition</td></tr>
</tbody></table>`
            },
            {
              heading: 'Reference scenario',
              html: `<p><strong>Scenario:</strong> a healthcare company must guarantee that PHI buckets in 300 accounts can never be read by principals outside the organization, even if a developer writes a permissive bucket policy, and that employees cannot copy data to personal AWS accounts.</p>
<ul>
<li>Attach an <strong>RCP</strong> to the Workloads OU that denies <code>s3:*</code> unless <code>aws:PrincipalOrgID</code> equals the org ID (with an exception for AWS service principals).</li>
<li>Attach an <strong>SCP</strong> that denies S3 actions when <code>aws:ResourceOrgID</code> is not the org ID, stopping exfiltration to external buckets.</li>
<li>Require access through VPC endpoints with endpoint policies, and use Identity Center with ABAC for human access.</li>
</ul>`
            }
          ],
          keyPoints: [
            `SCPs cap what principals in member accounts can do; RCPs cap what can be done to resources in member accounts.`,
            `Neither SCPs nor RCPs grant permissions, apply to the management account, or affect service-linked roles.`,
            `Cross-account access needs an allow on both sides: identity policy and resource or trust policy.`,
            `Data perimeter keys: aws:PrincipalOrgID, aws:ResourceOrgID, aws:SourceVpce.`,
            `Identity Center + external IdP uses SAML 2.0 for sign-in and SCIM for provisioning; permission sets become roles.`,
            `Use ExternalId for third-party role assumption; use RAM for resources without resource policies (subnets, TGW, Resolver rules).`
          ],
          examTips: [
            `If the question says "prevent principals outside the organization from accessing resources, regardless of resource policies", think RCP with aws:PrincipalOrgID.`,
            `If the question says "prevent our users from accessing buckets in other organizations", think SCP with aws:ResourceOrgID.`,
            `If an SCP "allows" something but the user still cannot do it, remember an identity policy must also grant it.`,
            `If many teams need to launch resources into a centrally managed network, think VPC sharing with RAM rather than one VPC per account plus peering.`
          ],
          services: ['AWS Organizations', 'IAM', 'IAM Identity Center', 'AWS STS', 'AWS Resource Access Manager', 'IAM Access Analyzer', 'AWS KMS']
        },
        {
          id: 'p-hybrid-connectivity',
          title: 'Hybrid & Multi-VPC Networking: Transit Gateway, Direct Connect & VPN',
          minutes: 20,
          summary: `Build segmented hub-and-spoke routing with Transit Gateway and connect it to data centers with Direct Connect designs that match the required resiliency and encryption.`,
          sections: [
            {
              heading: 'Transit Gateway routing domains',
              html: `<p>A Transit Gateway (TGW) is a regional router. Its power is in <strong>multiple route tables</strong>: each attachment is <em>associated</em> with exactly one route table (which table is used to route traffic coming from it) and can <em>propagate</em> its routes into any number of route tables.</p>
<ul>
<li><strong>Segmentation:</strong> Prod VPCs associate with a Prod table, Dev VPCs with a Dev table; both propagate to a Shared table used by the shared-services VPC and the VPN/DX attachment. Prod and Dev cannot reach each other because neither table has the other's routes.</li>
<li><strong>Blackhole routes</strong> explicitly drop traffic to a CIDR.</li>
<li><strong>Inter-Region peering</strong> connects TGWs across Regions over the AWS backbone; peering attachments use <strong>static routes</strong> (no propagation across the peering).</li>
<li><strong>Appliance mode</strong> on the inspection VPC attachment keeps both directions of a flow on the same AZ's appliance – required for stateful firewalls.</li>
<li>Share the TGW with other accounts using <strong>RAM</strong>; the network account owns the route tables.</li>
</ul>
<div class="callout">VPC peering is non-transitive and has no central route control; it is still the right answer for a small number of VPCs needing high-bandwidth, low-cost point-to-point traffic, because peering has no per-GB processing charge while TGW does.</div>`
            },
            {
              heading: 'Direct Connect building blocks',
              html: `<table><thead><tr><th>Component</th><th>What it does</th></tr></thead><tbody>
<tr><td>Dedicated connection</td><td>Physical port (1, 10, 100 or 400 Gbps) ordered from AWS at a DX location</td></tr>
<tr><td>Hosted connection</td><td>Capacity provisioned by a DX Partner (sub-1 Gbps up to 25 Gbps); one VIF per hosted connection</td></tr>
<tr><td>Private VIF</td><td>Reaches a VGW or a Direct Connect gateway for VPC private IPs</td></tr>
<tr><td>Public VIF</td><td>Reaches AWS public endpoints (S3, DynamoDB public IPs, VPN endpoints) over DX</td></tr>
<tr><td>Transit VIF</td><td>Reaches a Direct Connect gateway associated with Transit Gateways</td></tr>
<tr><td>Direct Connect gateway</td><td>Global object: one DX connection reaches VGWs/TGWs in many Regions and accounts</td></tr>
<tr><td>LAG</td><td>Bundles multiple same-speed dedicated connections at one DX location into one logical link using LACP</td></tr>
</tbody></table>
<p>BGP controls path selection. From on-premises, use <strong>AS_PATH prepending</strong> or more specific prefixes to influence inbound traffic; use the AWS <strong>local preference communities</strong> (<code>7224:7100</code> low, <code>7224:7200</code> medium, <code>7224:7300</code> high) to influence which connection AWS uses to send traffic back to you. When the same prefix is learned over DX and VPN, AWS prefers the Direct Connect path.</p>`
            },
            {
              heading: 'Resiliency models',
              html: `<table><thead><tr><th>Model</th><th>Topology</th><th>Survives</th></tr></thead><tbody>
<tr><td>Maximum resiliency</td><td>Separate connections on separate devices in <strong>at least two DX locations</strong> (for example 2 + 2)</td><td>Device failure and full location failure, with capacity preserved</td></tr>
<tr><td>High resiliency</td><td>One connection at each of <strong>two DX locations</strong></td><td>Location failure</td></tr>
<tr><td>Development and test</td><td>Two connections on separate devices in <strong>one location</strong></td><td>Device failure only</td></tr>
<tr><td>Budget backup</td><td>One DX connection + Site-to-Site VPN backup</td><td>DX failure, at lower and variable bandwidth</td></tr>
</tbody></table>
<div class="callout warn">A LAG adds bandwidth and link redundancy but all members terminate at the <strong>same DX location</strong>. A LAG alone is never the answer to "survive a DX location outage".</div>`
            },
            {
              heading: 'Encryption over Direct Connect',
              html: `<p>Direct Connect is private but <strong>not encrypted</strong> by default. Options:</p>
<ul>
<li><strong>MACsec</strong> (Layer 2) on supported dedicated connections – line-rate encryption between your router and the AWS device.</li>
<li><strong>Site-to-Site VPN over a public VIF</strong> – IPsec to the VGW/TGW public endpoints, traversing DX.</li>
<li><strong>Private IP VPN</strong> – IPsec over a transit VIF to a TGW using private IP addresses, so no public VIF or internet exposure is needed.</li>
</ul>
<p>Site-to-Site VPN tunnels each provide up to about 1.25 Gbps. On a TGW you can aggregate multiple VPN tunnels with <strong>ECMP</strong> (BGP required); a VGW does not support ECMP across tunnels. <strong>Accelerated VPN</strong> uses Global Accelerator edge locations to improve internet-path performance and is supported only on TGW attachments.</p>`
            },
            {
              heading: 'Reference scenario',
              html: `<p><strong>Scenario:</strong> a manufacturer has 80 VPCs across us-east-1 and eu-west-1, two data centers, and a requirement that a single DX location outage must not reduce available bandwidth. Prod and non-prod must be isolated, and all hybrid traffic must be encrypted.</p>
<ul>
<li>One TGW per Region, shared via RAM, with Prod / Non-Prod / Shared route tables; inter-Region TGW peering with static routes.</li>
<li>Maximum-resiliency DX: two 10 Gbps connections at each of two DX locations, each with a transit VIF to a single Direct Connect gateway associated with both TGWs.</li>
<li>MACsec on the dedicated connections (or Private IP VPN over the transit VIFs if routers lack MACsec support).</li>
</ul>`
            }
          ],
          keyPoints: [
            `TGW route tables: associate once, propagate many; this creates isolated routing domains.`,
            `TGW peering is inter-Region with static routes; enable appliance mode for stateful inspection VPCs.`,
            `A Direct Connect gateway is global and lets one DX connection reach VPCs/TGWs in many Regions and accounts.`,
            `Maximum resiliency = separate devices in at least two DX locations; a LAG is single-location.`,
            `DX is not encrypted: use MACsec, VPN over a public VIF, or Private IP VPN over a transit VIF.`,
            `Scale VPN bandwidth with ECMP on a Transit Gateway, not a virtual private gateway.`
          ],
          examTips: [
            `If the question says "isolate environments but share a services VPC", think multiple TGW route tables with selective propagation.`,
            `If it says "survive the failure of a Direct Connect location", you need connections in two locations; a LAG or two links at one site is wrong.`,
            `If it says "encrypt traffic over Direct Connect without exposing public IPs", think Private IP VPN over a transit VIF to a TGW (or MACsec).`,
            `If one DX connection must reach VPCs in several Regions, think Direct Connect gateway.`,
            `If a stateful firewall in an inspection VPC drops return traffic, think TGW appliance mode.`
          ],
          services: ['AWS Transit Gateway', 'AWS Direct Connect', 'AWS Site-to-Site VPN', 'Amazon VPC', 'AWS Resource Access Manager']
        },
        {
          id: 'p-dns-privatelink-inspection',
          title: 'Hybrid DNS, PrivateLink & Centralized Egress/Inspection',
          minutes: 17,
          summary: `Resolve names across on-premises and many VPCs with Route 53 Resolver, expose services privately with PrivateLink, and inspect traffic centrally with Network Firewall or Gateway Load Balancer.`,
          sections: [
            {
              heading: 'Route 53 Resolver for hybrid DNS',
              html: `<p>Every VPC has the Route 53 Resolver at the VPC base +2 address. It is reachable only from inside the VPC, which is why hybrid DNS needs endpoints.</p>
<table><thead><tr><th>Direction</th><th>Component</th><th>How it works</th></tr></thead><tbody>
<tr><td>On-prem → AWS names</td><td><strong>Inbound endpoint</strong></td><td>ENIs in your VPC with IPs that on-prem DNS servers conditionally forward to (for example <code>aws.corp.example</code> private hosted zone)</td></tr>
<tr><td>AWS → on-prem names</td><td><strong>Outbound endpoint + forwarding rules</strong></td><td>Rules such as "forward <code>corp.example</code> to 10.0.0.10" are sent out through the outbound endpoint ENIs</td></tr>
</tbody></table>
<ul>
<li>Centralize endpoints in a shared-services/network account; <strong>share forwarding rules with RAM</strong> and associate them with spoke VPCs. Spokes do not need their own endpoints.</li>
<li>Associate <strong>private hosted zones</strong> with VPCs in other accounts (authorize the association from the zone owner, then associate from the VPC owner), or use <strong>Route 53 Profiles</strong> to bundle hosted zones, rules and DNS Firewall rule groups and share them across accounts and VPCs.</li>
<li><strong>Route 53 Resolver DNS Firewall</strong> blocks lookups of malicious or unapproved domains – a cheap, effective exfiltration control.</li>
</ul>`
            },
            {
              heading: 'PrivateLink and its alternatives',
              html: `<p><strong>AWS PrivateLink</strong> exposes a service behind a <strong>Network Load Balancer</strong> (or Gateway Load Balancer) as an endpoint service; consumers create <strong>interface VPC endpoints</strong> (ENIs) in their own VPC. Traffic is one-directional (consumer to provider), works with <strong>overlapping CIDRs</strong>, and never needs route tables, peering or TGW.</p>
<table><thead><tr><th>Option</th><th>Use when</th><th>Limitation</th></tr></thead><tbody>
<tr><td>PrivateLink</td><td>Expose one service to many consumers/accounts, overlapping IPs, SaaS</td><td>Consumer-initiated only; per-endpoint-hour and per-GB charges</td></tr>
<tr><td>VPC peering</td><td>Full bidirectional connectivity between few VPCs</td><td>No overlapping CIDRs, non-transitive</td></tr>
<tr><td>Transit Gateway</td><td>Full mesh routing at scale with segmentation</td><td>No overlapping CIDRs within a routing domain</td></tr>
<tr><td>Amazon VPC Lattice</td><td>Service-to-service (HTTP/gRPC/TCP) across accounts with auth policies</td><td>Application-layer service network, not general IP routing</td></tr>
</tbody></table>
<p>Gateway endpoints for <strong>S3 and DynamoDB</strong> are free and route-table based but are only usable from inside the VPC; on-premises clients need an S3 <em>interface</em> endpoint.</p>`
            },
            {
              heading: 'Centralized egress and inspection',
              html: `<p>Rather than putting a NAT gateway and firewall in every VPC, a hub design sends spoke traffic through a TGW to an <strong>egress/inspection VPC</strong>.</p>
<ul>
<li><strong>AWS Network Firewall</strong>: managed stateful/stateless firewall with Suricata-compatible rules and domain (SNI/Host) allow-lists. Deploy firewall endpoints per AZ; route TGW attachment subnets to the firewall endpoints, and firewall subnets to NAT gateways.</li>
<li><strong>Gateway Load Balancer (GWLB)</strong>: for third-party virtual appliances. It uses <strong>GENEVE on port 6081</strong> to transparently pass packets to an appliance fleet and scales/health-checks it; consumers reach it through <strong>GWLB endpoints</strong> as a route-table target.</li>
<li>Enable <strong>appliance mode</strong> on the TGW attachment for the inspection VPC so flows stay symmetric.</li>
<li><strong>AWS Firewall Manager</strong> deploys and audits Network Firewall, WAF, security group and DNS Firewall policies org-wide.</li>
</ul>
<div class="callout warn">Centralized egress saves NAT gateway hours, but TGW data processing charges apply to every GB. For very high-volume S3 traffic, add gateway endpoints in each spoke so that traffic bypasses the hub entirely.</div>`
            },
            {
              heading: 'Reference scenario',
              html: `<p><strong>Scenario:</strong> 150 spoke VPCs must resolve <code>corp.example</code> on-premises, on-premises apps must resolve <code>internal.aws.example</code>, and all internet egress must be filtered to an allow-list of domains.</p>
<ul>
<li>Inbound and outbound Resolver endpoints in the shared-services VPC (two AZs each); on-prem DNS conditionally forwards <code>internal.aws.example</code> to the inbound endpoint IPs.</li>
<li>A forwarding rule for <code>corp.example</code> shared via RAM to all accounts and associated with every spoke VPC (or delivered via a Route 53 Profile).</li>
<li>Spoke default routes point to the TGW; the inspection VPC runs Network Firewall with a stateful domain allow-list, then NAT gateways; appliance mode is on.</li>
</ul>`
            }
          ],
          keyPoints: [
            `Inbound Resolver endpoints serve on-prem queries for AWS names; outbound endpoints + rules forward AWS queries to on-prem.`,
            `Share Resolver rules via RAM so spoke VPCs need no endpoints of their own.`,
            `PrivateLink needs an NLB (or GWLB) on the provider side and tolerates overlapping CIDRs.`,
            `GWLB uses GENEVE (port 6081) to insert third-party appliances transparently.`,
            `Centralized inspection requires TGW appliance mode for symmetric flows.`,
            `Gateway endpoints (S3, DynamoDB) are free but not reachable from on-premises.`
          ],
          examTips: [
            `If on-premises servers cannot resolve a private hosted zone, think Route 53 Resolver inbound endpoint plus conditional forwarding.`,
            `If a SaaS provider must expose an API to hundreds of customer VPCs with overlapping CIDRs, think PrivateLink endpoint service behind an NLB.`,
            `If the question mentions third-party firewall appliances that must scale transparently, think Gateway Load Balancer.`,
            `If the requirement is "filter outbound traffic by domain name centrally", think Network Firewall stateful domain lists in an inspection VPC (or DNS Firewall for DNS-level blocking).`
          ],
          services: ['Amazon Route 53 Resolver', 'Route 53 Profiles', 'AWS PrivateLink', 'Amazon VPC Lattice', 'AWS Network Firewall', 'Gateway Load Balancer', 'AWS Firewall Manager']
        }
      ]
    },
    // =====================================================================
    // DOMAIN 2 — NEW SOLUTIONS
    // =====================================================================
    {
      id: 'new',
      name: 'Design for New Solutions',
      weight: 29,
      summary: `Design new workloads that meet explicit RPO/RTO, scale, security and deployment requirements using multi-Region data stores, event-driven services, containers, caching and a layered security architecture.`,
      lessons: [
        {
          id: 'p-multi-region-active-active',
          title: 'Multi-Region Resilience: Active/Active, Aurora Global Database, DynamoDB Global Tables & Route 53 ARC',
          minutes: 20,
          summary: `Match a DR strategy to RPO/RTO and cost, then pick the multi-Region data and traffic-control services that deliver it.`,
          sections: [
            {
              heading: 'Choosing a DR strategy from RPO/RTO',
              html: `<table><thead><tr><th>Strategy</th><th>Secondary Region state</th><th>Typical RTO</th><th>Typical RPO</th><th>Cost</th></tr></thead><tbody>
<tr><td>Backup &amp; restore</td><td>Backups only (AWS Backup cross-Region copy)</td><td>Hours</td><td>Hours</td><td>Lowest</td></tr>
<tr><td>Pilot light</td><td>Data replicated; compute off or minimal</td><td>Tens of minutes</td><td>Seconds–minutes</td><td>Low</td></tr>
<tr><td>Warm standby</td><td>Full stack running at reduced scale</td><td>Minutes</td><td>Seconds</td><td>Medium</td></tr>
<tr><td>Multi-site active/active</td><td>Full stack serving traffic</td><td>Near zero</td><td>Near zero (data store dependent)</td><td>Highest</td></tr>
</tbody></table>
<p>The deciding factor is usually <strong>the data layer</strong>. Stateless compute is easy to run in two Regions; the hard questions are replication lag, write conflicts and who is allowed to write where.</p>`
            },
            {
              heading: 'Aurora Global Database',
              html: `<ul>
<li>One <strong>primary Region</strong> takes writes; up to several <strong>read-only secondary Regions</strong> receive storage-level replication, typically with lag under one second, without consuming database engine resources.</li>
<li><strong>Switchover</strong> (planned) moves the primary with no data loss; <strong>failover</strong> (unplanned) promotes a secondary and can lose the replication lag worth of data. Using the managed operations preserves the global topology.</li>
<li><strong>Write forwarding</strong> lets applications in a secondary Region send writes that are forwarded to the primary, simplifying "read local, write anywhere" designs while keeping a single writer.</li>
<li>Aurora DSQL (GA 2025) is a different, serverless distributed SQL engine offering active-active multi-Region writes with strong consistency; consider it for new designs that need multi-Region writes on SQL.</li>
</ul>
<div class="callout">Aurora Global Database is <strong>single-writer</strong>. If a question requires writes in every Region with low latency and conflict tolerance, DynamoDB global tables (or Aurora DSQL) fits better.</div>`
            },
            {
              heading: 'DynamoDB global tables',
              html: `<ul>
<li><strong>Multi-active:</strong> every replica accepts reads and writes. Default mode replicates asynchronously (typically within a second) with <strong>last-writer-wins</strong> conflict resolution – design so that a given item is written primarily in one Region, or tolerate LWW.</li>
<li><strong>Multi-Region strong consistency (MRSC)</strong> is available for global tables deployed across three Regions (or two Regions plus a witness), giving an RPO of zero at the cost of higher write latency.</li>
<li>Strongly consistent reads in the default mode are only consistent within the Region that took the write.</li>
<li>Replication uses DynamoDB Streams internally; capacity must be sufficient in every replica Region (or use on-demand).</li>
</ul>`
            },
            {
              heading: 'Controlling traffic: Route 53, Global Accelerator and ARC',
              html: `<table><thead><tr><th>Mechanism</th><th>Strength</th><th>Weakness</th></tr></thead><tbody>
<tr><td>Route 53 failover/latency records + health checks</td><td>Simple, automatic</td><td>DNS TTL and client caching delay; health checks can flap or be fooled by partial failures</td></tr>
<tr><td>AWS Global Accelerator</td><td>Static anycast IPs, fast failover without DNS caching, traffic dials</td><td>TCP/UDP only at the edge; extra cost</td></tr>
<tr><td>Route 53 ARC routing controls</td><td>Human- or automation-driven on/off switches with a highly available data plane in multiple Regions; safety rules prevent turning everything off</td><td>Requires a cluster (fixed hourly cost)</td></tr>
<tr><td>ARC zonal shift / zonal autoshift</td><td>Moves load balancer traffic away from an impaired AZ</td><td>AZ-level, not Region-level</td></tr>
<tr><td>ARC Region switch</td><td>Orchestrated, plan-based cross-Region failover runbooks</td><td>Plans must be authored and tested</td></tr>
</tbody></table>
<div class="callout warn">Failover runbooks must never depend on the control plane of the impaired Region. Route 53 ARC routing controls are changed through the cluster's data-plane endpoints precisely for this reason.</div>`
            },
            {
              heading: 'Reference scenario',
              html: `<p><strong>Scenario:</strong> a payments platform needs RPO near zero for its ledger and an RTO under 5 minutes, with users in North America and Europe served locally.</p>
<ul>
<li>Stateless services on ECS/Fargate in us-east-1 and eu-west-1 behind ALBs, fronted by Global Accelerator or Route 53 latency records.</li>
<li>Ledger in DynamoDB global tables using multi-Region strong consistency across three Regions for RPO 0; user profile data in default-mode global tables.</li>
<li>Reporting database on Aurora Global Database (single writer), with write forwarding from the secondary Region.</li>
<li>Route 53 ARC routing controls to evacuate a Region deliberately, rehearsed quarterly with FIS.</li>
</ul>`
            }
          ],
          keyPoints: [
            `Pick DR strategy by RPO/RTO and budget: backup/restore, pilot light, warm standby, active/active.`,
            `Aurora Global Database: one writer, storage replication typically under 1 second, managed switchover/failover, write forwarding.`,
            `DynamoDB global tables are multi-active with last-writer-wins; MRSC mode offers RPO 0 across three Regions.`,
            `Route 53 ARC routing controls give a highly available, data-plane failover switch.`,
            `Global Accelerator fails over without waiting for DNS caches.`,
            `Never rely on the failed Region's control plane during failover.`
          ],
          examTips: [
            `If the question requires "writes in multiple Regions" with low latency, DynamoDB global tables (or Aurora DSQL) beats Aurora Global Database.`,
            `If it requires "RPO of seconds and RTO of about a minute for a relational database", think Aurora Global Database with managed failover.`,
            `If it says "avoid DNS caching delays during failover", think Global Accelerator.`,
            `If it says "reliable, manually controlled Region evacuation", think Route 53 ARC routing controls.`,
            `If cost is the top priority and hours of RTO are acceptable, choose backup and restore, not warm standby.`
          ],
          services: ['Amazon Aurora Global Database', 'Amazon DynamoDB global tables', 'Amazon Route 53', 'Amazon Route 53 Application Recovery Controller', 'AWS Global Accelerator', 'AWS Backup', 'Amazon Aurora DSQL']
        },
        {
          id: 'p-event-driven-serverless',
          title: 'Event-Driven & Serverless Architectures at Scale',
          minutes: 18,
          summary: `Choose between queues, streams, buses and workflows, and design for ordering, idempotency, back-pressure and failure.`,
          sections: [
            {
              heading: 'Picking the integration primitive',
              html: `<table><thead><tr><th>Service</th><th>Model</th><th>Ordering</th><th>Best for</th></tr></thead><tbody>
<tr><td>SQS Standard</td><td>Queue, pull, at-least-once</td><td>Best effort</td><td>Decoupling and buffering with nearly unlimited throughput</td></tr>
<tr><td>SQS FIFO</td><td>Queue, exactly-once processing within a deduplication window</td><td>Per message group ID</td><td>Ordered commands per entity (per account, per order)</td></tr>
<tr><td>SNS</td><td>Push pub/sub fan-out</td><td>FIFO topics available</td><td>Fan-out to queues, Lambda, HTTP, email/SMS</td></tr>
<tr><td>EventBridge</td><td>Event bus with content-based rules</td><td>None guaranteed</td><td>Routing events across services, accounts and SaaS; schema registry; archive and replay</td></tr>
<tr><td>Kinesis Data Streams</td><td>Ordered, replayable log of shards</td><td>Per shard (partition key)</td><td>High-volume streaming, multiple independent consumers, replay</td></tr>
<tr><td>Amazon MSK</td><td>Managed Apache Kafka</td><td>Per partition</td><td>Kafka compatibility and ecosystem</td></tr>
</tbody></table>
<p>Kinesis capacity per shard is 1 MB/s or 1,000 records/s in and 2 MB/s out; <strong>enhanced fan-out</strong> gives each registered consumer its own 2 MB/s per shard. On-demand mode removes shard planning. SQS FIFO deduplicates on a 5-minute window using a deduplication ID or content hash; use <strong>high-throughput mode</strong> and many message group IDs to scale.</p>`
            },
            {
              heading: 'Step Functions orchestration',
              html: `<table><thead><tr><th></th><th>Standard workflows</th><th>Express workflows</th></tr></thead><tbody>
<tr><td>Duration</td><td>Up to one year</td><td>Up to five minutes</td></tr>
<tr><td>Execution semantics</td><td>Exactly-once</td><td>At-least-once (async) / at-most-once (sync)</td></tr>
<tr><td>Pricing</td><td>Per state transition</td><td>Per execution, duration and memory</td></tr>
<tr><td>Fits</td><td>Long-running business processes, human approval (task tokens)</td><td>High-volume, short event processing</td></tr>
</tbody></table>
<ul>
<li><strong>Distributed Map</strong> runs up to thousands of parallel child executions over items in S3 – ideal for large-scale batch processing without a cluster.</li>
<li><strong>Service integrations</strong> (optimized and AWS SDK) call DynamoDB, SQS, ECS, Glue, Bedrock and more without Lambda glue code.</li>
<li>Use <code>.waitForTaskToken</code> for callbacks and <code>Retry</code>/<code>Catch</code> for saga-style compensating transactions.</li>
</ul>`
            },
            {
              heading: 'Designing for failure and scale',
              html: `<ul>
<li><strong>Idempotency:</strong> at-least-once delivery means duplicates. Use idempotency keys (for example, conditional writes in DynamoDB, or Powertools for AWS Lambda idempotency utility).</li>
<li><strong>Dead-letter queues and on-failure destinations</strong> for SQS consumers, async Lambda invocations and EventBridge targets; set the SQS visibility timeout to at least six times the Lambda function timeout when Lambda polls the queue.</li>
<li><strong>Back-pressure:</strong> put SQS between a spiky producer and a fragile downstream (for example an RDS database), and cap Lambda <em>maximum concurrency</em> on the event source mapping or use reserved concurrency.</li>
<li><strong>Partial batch responses</strong> (<code>ReportBatchItemFailures</code>) prevent a single poison message from reprocessing a whole batch.</li>
<li><strong>EventBridge Pipes</strong> connect sources (SQS, Kinesis, DynamoDB Streams) to targets with filtering and enrichment; <strong>EventBridge Scheduler</strong> replaces cron-on-EC2.</li>
<li>Cross-account eventing: send events to a central bus in another account via a rule target, governed by the bus resource policy.</li>
</ul>`
            },
            {
              heading: 'Reference scenario',
              html: `<p><strong>Scenario:</strong> an e-commerce company processes orders where each customer's events must be applied in order, inventory updates must never double-count, and order spikes reach 50x normal during flash sales.</p>
<ul>
<li>API Gateway → SQS FIFO with <code>MessageGroupId = customerId</code> (high-throughput mode) for ordering per customer while allowing parallelism across customers.</li>
<li>Lambda consumers with idempotent conditional writes to DynamoDB; partial batch responses and a DLQ.</li>
<li>Order-placed events published to EventBridge; rules route to fulfillment (Step Functions Standard with a saga for payment and shipping), analytics (Kinesis Data Firehose to S3) and a partner bus in another account.</li>
</ul>`
            }
          ],
          keyPoints: [
            `Ordering per entity at scale: SQS FIFO message groups or Kinesis partition keys.`,
            `EventBridge for content-based routing, cross-account buses, SaaS sources, archive and replay.`,
            `Kinesis: replayable, multiple consumers; enhanced fan-out for dedicated per-consumer throughput.`,
            `Step Functions Standard (up to one year, exactly-once) vs Express (up to five minutes, high volume).`,
            `Distributed Map for massive parallel batch over S3 objects.`,
            `Design idempotent consumers, DLQs, and concurrency limits to protect downstream systems.`
          ],
          examTips: [
            `If messages must be processed in order per customer with no duplicates, think SQS FIFO with message group ID = customer ID.`,
            `If several independent applications must read the same stream and replay it, think Kinesis Data Streams (enhanced fan-out), not SQS.`,
            `If a workflow needs human approval that can take days, think Step Functions Standard with a task token.`,
            `If Lambda overwhelms a relational database, think SQS buffer plus maximum concurrency, or RDS Proxy.`
          ],
          services: ['Amazon SQS', 'Amazon SNS', 'Amazon EventBridge', 'AWS Step Functions', 'Amazon Kinesis Data Streams', 'Amazon Data Firehose', 'AWS Lambda', 'Amazon MSK']
        },
        {
          id: 'p-containers-caching',
          title: 'Containers at Scale (ECS & EKS) and Caching Layers',
          minutes: 17,
          summary: `Pick the right container orchestrator and capacity model, and add the cache tier that removes the real bottleneck.`,
          sections: [
            {
              heading: 'ECS vs EKS',
              html: `<table><thead><tr><th>Criterion</th><th>Amazon ECS</th><th>Amazon EKS</th></tr></thead><tbody>
<tr><td>Operating model</td><td>AWS-native, simple, no control plane to manage or pay for</td><td>Upstream Kubernetes; per-cluster control-plane fee</td></tr>
<tr><td>Portability</td><td>AWS-specific task definitions</td><td>Kubernetes manifests, Helm, operators; hybrid via EKS Anywhere / Hybrid Nodes</td></tr>
<tr><td>Skills required</td><td>Low</td><td>Kubernetes expertise</td></tr>
<tr><td>IAM for pods/tasks</td><td>Task roles</td><td>EKS Pod Identity or IRSA</td></tr>
<tr><td>Serverless capacity</td><td>Fargate</td><td>Fargate; EKS Auto Mode manages nodes for you</td></tr>
</tbody></table>
<p>Choose <strong>ECS</strong> when the requirement emphasizes the least operational overhead and the team is not already invested in Kubernetes. Choose <strong>EKS</strong> when the company has Kubernetes tooling, needs portability across clouds or on-premises, or depends on the CNCF ecosystem.</p>`
            },
            {
              heading: 'Capacity and scaling choices',
              html: `<ul>
<li><strong>Fargate</strong>: no nodes, per-task billing, strong isolation; no GPUs, no privileged containers, no DaemonSets on EKS Fargate.</li>
<li><strong>EC2 capacity</strong>: needed for GPUs, specific instance types, or maximum bin-packing efficiency. On ECS, use <strong>capacity providers</strong> with managed scaling; on EKS, use <strong>Karpenter</strong> (or EKS Auto Mode) to provision right-sized nodes quickly.</li>
<li><strong>Spot</strong>: mix Fargate Spot or EC2 Spot capacity providers for fault-tolerant tasks; Karpenter can diversify across many instance types to reduce interruptions.</li>
<li><strong>Networking</strong>: <code>awsvpc</code> mode gives each task/pod its own ENI/IP. On EKS, IP exhaustion is common – mitigate with prefix delegation or secondary CIDRs (for example from 100.64.0.0/10) with custom networking.</li>
<li><strong>Service-to-service</strong>: ECS Service Connect, or VPC Lattice across accounts and clusters.</li>
</ul>`
            },
            {
              heading: 'Caching layers',
              html: `<table><thead><tr><th>Layer</th><th>Service</th><th>Removes</th></tr></thead><tbody>
<tr><td>Edge</td><td>CloudFront (with Origin Shield)</td><td>Origin load and latency for static and cacheable dynamic content</td></tr>
<tr><td>API</td><td>API Gateway REST API caching</td><td>Repeated identical backend calls</td></tr>
<tr><td>Application / database</td><td>ElastiCache (Valkey, Redis OSS, Memcached)</td><td>Hot reads, sessions, leaderboards, rate limits</td></tr>
<tr><td>DynamoDB-specific</td><td>DynamoDB Accelerator (DAX)</td><td>Microsecond reads for eventually consistent DynamoDB access with no code redesign</td></tr>
<tr><td>Database read scaling</td><td>Aurora/RDS read replicas</td><td>Read load where caching is not possible</td></tr>
</tbody></table>
<ul>
<li><strong>Lazy loading</strong> (cache-aside) caches only what is read but can serve stale data; <strong>write-through</strong> keeps the cache fresh but writes data that may never be read. Use TTLs with both.</li>
<li>DAX does not help strongly consistent reads; they pass through to DynamoDB.</li>
<li>ElastiCache Global Datastore replicates Valkey/Redis OSS clusters across Regions for low-latency local reads and DR.</li>
</ul>`
            },
            {
              heading: 'Reference scenario',
              html: `<p><strong>Scenario:</strong> a media company runs 40 microservices on self-managed Kubernetes on EC2, struggles with node patching, and sees its product catalog database at 90% CPU from repeated reads.</p>
<ul>
<li>Move to EKS (keeps manifests and Helm charts) with Karpenter or EKS Auto Mode for node lifecycle; use Pod Identity for AWS permissions.</li>
<li>Put ElastiCache (Valkey) in front of the catalog with cache-aside and short TTLs; cache catalog images and API responses on CloudFront.</li>
<li>Run batch transcoding on Spot-backed node pools with diversified instance types.</li>
</ul>`
            }
          ],
          keyPoints: [
            `ECS = least operational overhead; EKS = Kubernetes ecosystem and portability.`,
            `Fargate removes node management but has limits (no GPUs, no privileged containers, no DaemonSets on EKS Fargate).`,
            `Karpenter or EKS Auto Mode for fast, right-sized node provisioning on EKS.`,
            `Fix EKS IP exhaustion with prefix delegation or secondary CIDR custom networking.`,
            `DAX accelerates eventually consistent DynamoDB reads; ElastiCache for general caching.`,
            `CloudFront with Origin Shield reduces origin load across many edge locations.`
          ],
          examTips: [
            `If the team already uses Kubernetes manifests and Helm and wants managed control plane, think EKS, not a rewrite to ECS.`,
            `If the question says "least operational overhead" with no Kubernetes requirement, think ECS on Fargate.`,
            `If DynamoDB reads need microsecond latency with minimal code changes, think DAX.`,
            `If pods cannot get IP addresses, think VPC CNI prefix delegation or secondary CIDR ranges.`
          ],
          services: ['Amazon ECS', 'Amazon EKS', 'AWS Fargate', 'Karpenter', 'Amazon ElastiCache', 'Amazon DynamoDB Accelerator (DAX)', 'Amazon CloudFront']
        },
        {
          id: 'p-security-architecture',
          title: 'Security Architecture: KMS, CloudHSM, Security Hub & Centralized Logging',
          minutes: 18,
          summary: `Design encryption key hierarchies, select the right key custody model, and centralize detection and logs across the organization.`,
          sections: [
            {
              heading: 'Key custody options',
              html: `<table><thead><tr><th>Option</th><th>Who controls HSMs</th><th>When to use</th></tr></thead><tbody>
<tr><td>AWS owned / AWS managed keys</td><td>AWS</td><td>Default encryption with no key management; AWS managed keys cannot be shared cross-account</td></tr>
<tr><td>KMS customer managed keys</td><td>AWS (FIPS-validated HSMs)</td><td>Most workloads: key policies, rotation, grants, cross-account use, CloudTrail audit</td></tr>
<tr><td>KMS custom key store (CloudHSM)</td><td>You, in your CloudHSM cluster</td><td>Need KMS integration but keys must live in single-tenant HSMs you control</td></tr>
<tr><td>KMS external key store (XKS)</td><td>You, outside AWS</td><td>Regulatory requirement to keep key material outside AWS</td></tr>
<tr><td>AWS CloudHSM directly</td><td>You</td><td>Custom crypto via PKCS#11/JCE/CNG, TLS offload, Oracle TDE, signing with full control</td></tr>
</tbody></table>
<p><strong>Imported key material</strong> (BYOK) lets you control the origin and expiry of material, but you are responsible for durability – if you delete it and lose your copy, the data is unrecoverable.</p>`
            },
            {
              heading: 'KMS multi-Region keys and cross-account patterns',
              html: `<ul>
<li><strong>Multi-Region keys</strong> share the same key ID and key material across Regions, so ciphertext encrypted in one Region can be decrypted in another <em>without a cross-Region call</em>. Each replica is an independent resource with its own key policy. Use them for client-side encryption of globally replicated data, DynamoDB global tables, and DR copies.</li>
<li>They are not a global key: you create a primary and explicitly replicate it.</li>
<li><strong>Cross-account</strong>: the key policy must allow the external account, and the external account's IAM policy must allow the principal. AWS managed keys cannot be used cross-account – a common reason cross-account S3 access to SSE-KMS objects fails.</li>
<li><strong>Envelope encryption</strong> with data keys means KMS never sees bulk data; S3 Bucket Keys reduce KMS request costs.</li>
</ul>`
            },
            {
              heading: 'Detection and posture at org scale',
              html: `<ul>
<li><strong>AWS Security Hub</strong> aggregates findings from GuardDuty, Inspector, Macie, IAM Access Analyzer, Config and partner tools, runs security standards (AWS Foundational Security Best Practices, CIS) and supports a delegated admin, <strong>central configuration</strong> of member accounts and <strong>cross-Region aggregation</strong>. (AWS now brands the posture-check capability Security Hub CSPM within the broader Security Hub.)</li>
<li><strong>GuardDuty</strong>: threat detection from CloudTrail, VPC Flow Logs, DNS logs, plus protection plans (S3, EKS, Runtime, Malware Protection, RDS, Lambda).</li>
<li><strong>Amazon Detective</strong> for investigation graphs; <strong>Amazon Inspector</strong> for vulnerability scanning of EC2, ECR images and Lambda.</li>
<li>Automate response with EventBridge rules on findings, invoking Step Functions or Systems Manager Automation runbooks.</li>
</ul>`
            },
            {
              heading: 'Centralized logging',
              html: `<ul>
<li><strong>Organization trail</strong> in CloudTrail delivered to a Log Archive account bucket with SSE-KMS, <strong>S3 Object Lock</strong> (compliance mode for strict WORM), and CloudTrail log file validation.</li>
<li><strong>CloudTrail Lake</strong> for SQL queries over events with long retention; <strong>Amazon Security Lake</strong> normalizes logs into OCSF in your S3 for SIEM integration.</li>
<li>VPC Flow Logs, ALB/CloudFront access logs and WAF logs to the same archive; CloudWatch Logs cross-account subscription or cross-account observability for operational logs.</li>
<li>Protect the pipeline itself: SCPs that deny disabling CloudTrail, GuardDuty, Config, or changing the Log Archive bucket policy.</li>
</ul>
<div class="callout warn">S3 Object Lock governance mode can be bypassed by principals with <code>s3:BypassGovernanceRetention</code>. If the requirement says "no one, including the root user, can delete logs during the retention period", the answer is compliance mode.</div>`
            },
            {
              heading: 'Reference scenario',
              html: `<p><strong>Scenario:</strong> a fintech must encrypt data with keys stored in single-tenant HSMs it controls, while still using native SSE-KMS on S3, EBS and RDS, and must replicate encrypted backups to a second Region.</p>
<ul>
<li>KMS custom key store backed by a CloudHSM cluster (at least two HSMs in different AZs) for regulated keys.</li>
<li>For the DR copies, use KMS keys in the DR Region (custom key stores do not support multi-Region keys); AWS Backup re-encrypts copies with the destination key.</li>
<li>Security Hub delegated admin in the Security Tooling account, aggregating all Regions; org trail to Log Archive with Object Lock compliance mode.</li>
</ul>`
            }
          ],
          keyPoints: [
            `Customer managed KMS keys are the default choice; AWS managed keys cannot be shared cross-account.`,
            `CloudHSM = single-tenant HSMs you control; custom key store connects it to KMS.`,
            `Multi-Region keys share key ID and material; each replica has its own key policy.`,
            `Security Hub: delegated admin, central configuration and cross-Region aggregation.`,
            `Organization CloudTrail to a Log Archive account with Object Lock compliance mode for immutable logs.`,
            `Security Lake normalizes security logs to OCSF for SIEM tools.`
          ],
          examTips: [
            `If the question requires "FIPS validated single-tenant HSM under customer control", think CloudHSM (or KMS custom key store if native service integration is needed).`,
            `If encrypted data replicated across Regions must be decrypted locally without cross-Region calls, think KMS multi-Region keys.`,
            `If cross-account access to SSE-KMS objects fails, check whether the bucket uses an AWS managed key; switch to a customer managed key with a key policy grant.`,
            `If logs must be immutable even for root, think S3 Object Lock in compliance mode.`
          ],
          services: ['AWS KMS', 'AWS CloudHSM', 'AWS Security Hub', 'Amazon GuardDuty', 'AWS CloudTrail', 'Amazon Security Lake', 'Amazon S3 Object Lock', 'Amazon Inspector']
        }
      ]
    },
    // =====================================================================
    // DOMAIN 3 — CONTINUOUS IMPROVEMENT
    // =====================================================================
    {
      id: 'improve',
      name: 'Continuous Improvement for Existing Solutions',
      weight: 25,
      summary: `Take a running workload and make it more observable, faster, more reliable, cheaper and safer to change, using evidence rather than guesswork.`,
      lessons: [
        {
          id: 'p-observability-performance',
          title: 'Observability & Performance Tuning of Existing Workloads',
          minutes: 16,
          summary: `Instrument a workload end to end, find the real bottleneck, and apply the targeted fix for compute, database, storage or network.`,
          sections: [
            {
              heading: 'The observability toolkit',
              html: `<table><thead><tr><th>Need</th><th>Service / feature</th></tr></thead><tbody>
<tr><td>Metrics, alarms, composite alarms, anomaly detection</td><td>Amazon CloudWatch</td></tr>
<tr><td>Distributed tracing and service maps</td><td>AWS X-Ray / CloudWatch Application Signals (OpenTelemetry based)</td></tr>
<tr><td>Log analytics</td><td>CloudWatch Logs Insights, Contributor Insights for top-N talkers</td></tr>
<tr><td>Synthetic and real-user monitoring</td><td>CloudWatch Synthetics canaries, CloudWatch RUM</td></tr>
<tr><td>Cross-account single pane</td><td>CloudWatch cross-account observability (monitoring account linked to source accounts)</td></tr>
<tr><td>Prometheus/Grafana ecosystems</td><td>Amazon Managed Service for Prometheus, Amazon Managed Grafana</td></tr>
<tr><td>Database load analysis</td><td>CloudWatch Database Insights / Performance Insights</td></tr>
</tbody></table>
<p>Define <strong>SLOs</strong> on user-facing signals (latency percentiles, error rate) and alarm on them, rather than on CPU. Composite alarms reduce noise by alerting only when several symptoms coincide.</p>`
            },
            {
              heading: 'Finding and fixing bottlenecks',
              html: `<table><thead><tr><th>Symptom</th><th>Likely cause</th><th>Targeted fix</th></tr></thead><tbody>
<tr><td>RDS high CPU from repeated identical reads</td><td>Read-heavy hot data</td><td>ElastiCache cache-aside or read replicas</td></tr>
<tr><td>"Too many connections" from Lambda</td><td>Connection storms</td><td>RDS Proxy</td></tr>
<tr><td>DynamoDB throttling on one key</td><td>Hot partition</td><td>Better partition key, write sharding, DAX for reads</td></tr>
<tr><td>EBS volume latency high, IOPS capped</td><td>Volume or instance EBS throughput limit</td><td>gp3 with provisioned IOPS/throughput, io2 Block Express, or an EBS-optimized larger instance</td></tr>
<tr><td>S3 high request rates on one prefix</td><td>Per-prefix request scaling</td><td>Spread keys across more prefixes; S3 Express One Zone for single-digit-ms access</td></tr>
<tr><td>Global users see slow uploads</td><td>Long internet path</td><td>S3 Transfer Acceleration or multipart upload</td></tr>
<tr><td>HPC nodes need low inter-node latency</td><td>Network placement</td><td>Cluster placement group and Elastic Fabric Adapter</td></tr>
<tr><td>Lambda cold-start latency</td><td>Init time</td><td>Provisioned concurrency or SnapStart (Java, Python, .NET)</td></tr>
</tbody></table>
<p>Use <strong>AWS Compute Optimizer</strong> for right-sizing recommendations on EC2, Auto Scaling groups, EBS, Lambda, ECS on Fargate and RDS, based on observed utilization.</p>`
            },
            {
              heading: 'Operational excellence improvements',
              html: `<ul>
<li><strong>Systems Manager</strong>: Session Manager to remove bastions and SSH keys; Patch Manager with maintenance windows; Automation runbooks for remediation; Parameter Store for configuration.</li>
<li><strong>Config conformance packs</strong> with auto-remediation to fix drift continuously.</li>
<li><strong>Amazon DevOps Guru</strong> uses ML to detect anomalous operational behavior; <strong>AWS Health</strong> organizational view surfaces events across accounts.</li>
<li>Replace scheduled scripts on EC2 with EventBridge Scheduler + Lambda or Step Functions.</li>
</ul>`
            },
            {
              heading: 'Reference scenario',
              html: `<p><strong>Scenario:</strong> a SaaS company reports intermittent checkout latency in 30 accounts but each team only sees its own CloudWatch data, and root cause takes hours.</p>
<ul>
<li>Configure CloudWatch cross-account observability with a central monitoring account linked to all workload accounts via Organizations.</li>
<li>Instrument services with OpenTelemetry/Application Signals to trace calls across services and accounts; define SLOs on checkout p99 latency.</li>
<li>Traces reveal the payments service opens a new DB connection per invocation: add RDS Proxy; latency drops and connection errors vanish.</li>
</ul>`
            }
          ],
          keyPoints: [
            `Alarm on user-facing SLOs; use composite alarms to cut noise.`,
            `CloudWatch cross-account observability centralizes metrics, logs and traces in a monitoring account.`,
            `X-Ray / Application Signals traces locate latency across distributed services.`,
            `RDS Proxy fixes Lambda connection storms; ElastiCache or replicas fix read-heavy load.`,
            `Compute Optimizer gives right-sizing recommendations from observed utilization.`,
            `Session Manager removes bastion hosts and inbound SSH.`
          ],
          examTips: [
            `If many accounts need a single monitoring view with least effort, think CloudWatch cross-account observability.`,
            `If Lambda functions exhaust database connections, think RDS Proxy.`,
            `If a question asks how to find which component causes latency in a microservice chain, think X-Ray / Application Signals tracing.`,
            `If HPC needs the lowest inter-node latency, think cluster placement group + EFA.`
          ],
          services: ['Amazon CloudWatch', 'AWS X-Ray', 'AWS Compute Optimizer', 'Amazon RDS Proxy', 'AWS Systems Manager', 'Amazon Managed Grafana', 'Amazon DevOps Guru']
        },
        {
          id: 'p-reliability-chaos',
          title: 'Reliability Improvement, Chaos Engineering with FIS & Well-Architected Reviews',
          minutes: 16,
          summary: `Remove single points of failure, prove resilience with controlled fault injection, and run Well-Architected reviews as an improvement loop.`,
          sections: [
            {
              heading: 'Common reliability gaps and fixes',
              html: `<table><thead><tr><th>Gap</th><th>Improvement</th></tr></thead><tbody>
<tr><td>Single-AZ EC2 or database</td><td>Auto Scaling group across AZs; RDS Multi-AZ (or Multi-AZ DB cluster with two readable standbys)</td></tr>
<tr><td>Stateful sessions on instances</td><td>Externalize to ElastiCache or DynamoDB</td></tr>
<tr><td>Retry storms on dependency failure</td><td>Exponential backoff with jitter, timeouts, circuit breakers</td></tr>
<tr><td>No tested restore</td><td>AWS Backup with restore testing; cross-Region/cross-account copies; Backup Vault Lock</td></tr>
<tr><td>Self-managed file share on one server</td><td>Amazon EFS or FSx (Multi-AZ)</td></tr>
<tr><td>AZ impairment not handled</td><td>Route 53 ARC zonal shift / zonal autoshift on ALB/NLB; static stability (pre-provisioned capacity)</td></tr>
</tbody></table>
<p><strong>Static stability</strong> means the system keeps working during an impairment without needing to make control-plane changes (for example, running enough capacity in the remaining AZs already, instead of relying on scaling out during the event).</p>`
            },
            {
              heading: 'AWS Fault Injection Service (FIS)',
              html: `<ul>
<li><strong>Experiment templates</strong> define actions (stop/terminate instances, inject CPU or memory stress via SSM, throttle or fail API calls, disrupt network connectivity, fail over RDS/Aurora, interrupt Spot, pause ECS tasks or EKS pods), targets (by tag or resource ID) and <strong>stop conditions</strong> (CloudWatch alarms).</li>
<li><strong>Scenario library</strong> includes complex scenarios such as AZ power interruption and cross-Region connectivity disruption.</li>
<li>Run first in a non-prod account, then in production with a small blast radius; use FIS experiment roles with least privilege and multi-account experiments from a central account.</li>
<li>Integrate into CI/CD so that resilience regressions fail the pipeline.</li>
</ul>
<div class="callout">Pair FIS with <strong>AWS Resilience Hub</strong>, which assesses an application against defined RTO/RPO targets, recommends improvements, and can generate FIS experiments and alarms.</div>`
            },
            {
              heading: 'Well-Architected reviews as a process',
              html: `<p>The Well-Architected Framework has six pillars: <strong>operational excellence, security, reliability, performance efficiency, cost optimization and sustainability</strong>. The <strong>Well-Architected Tool</strong> records reviews, identifies high- and medium-risk issues, tracks milestones, and supports <strong>custom lenses</strong> for company-specific standards. Reviews can be shared across accounts and summarized at org level through the tool's integrations (for example with Trusted Advisor checks).</p>
<ul>
<li>Use it to prioritize: fix high-risk issues first, record a milestone, re-review after the change.</li>
<li>Domain-specific lenses (Serverless, SaaS, Financial Services and others) add targeted questions.</li>
</ul>`
            },
            {
              heading: 'Reference scenario',
              html: `<p><strong>Scenario:</strong> a retailer's order API failed during a past AZ event because the Auto Scaling group could not launch replacement capacity fast enough, and leadership wants proof it will not recur.</p>
<ul>
<li>Pre-provision capacity so that losing one AZ leaves enough instances (static stability), and enable zonal autoshift on the load balancer.</li>
<li>Define the RTO/RPO in Resilience Hub; run the FIS AZ power interruption scenario in staging with a stop condition on the error-rate alarm, then quarterly in production.</li>
<li>Record improvements as Well-Architected milestones.</li>
</ul>`
            }
          ],
          keyPoints: [
            `Static stability: survive impairments without control-plane actions.`,
            `Backoff with jitter, timeouts and circuit breakers prevent cascading failures.`,
            `FIS experiments need targets, actions and CloudWatch-alarm stop conditions.`,
            `Resilience Hub assesses apps against RTO/RPO targets and recommends fixes.`,
            `Six Well-Architected pillars include sustainability; custom lenses encode company standards.`,
            `AWS Backup restore testing and Vault Lock prove and protect recoverability.`
          ],
          examTips: [
            `If the question says "validate resilience by injecting failures in a controlled way", think AWS FIS with stop conditions.`,
            `If it says "assess whether the application meets its RTO/RPO", think Resilience Hub.`,
            `If it says "apply company-specific architecture standards in reviews", think Well-Architected Tool custom lens.`,
            `If an AZ is degraded but not down, think Route 53 ARC zonal shift.`
          ],
          services: ['AWS Fault Injection Service', 'AWS Resilience Hub', 'AWS Well-Architected Tool', 'AWS Backup', 'Amazon Route 53 Application Recovery Controller', 'Amazon EC2 Auto Scaling']
        },
        {
          id: 'p-cost-optimization-governance',
          title: 'Cost Optimization & Cost Governance at Organization Scale',
          minutes: 17,
          summary: `Combine purchase models, right-sizing, storage tiering and org-wide billing controls to cut cost without hurting reliability.`,
          sections: [
            {
              heading: 'Consolidated billing and commitment sharing',
              html: `<ul>
<li>Organizations consolidated billing aggregates usage across accounts for <strong>volume tiering</strong> (for example S3 tiers) and shares <strong>Reserved Instance and Savings Plans discounts</strong> across all accounts by default.</li>
<li>Discount sharing can be turned off for specific accounts from the management account's billing preferences (for example, a subsidiary that must be billed independently).</li>
<li>Commitments apply first to the account that bought them, then float to other accounts in the org.</li>
<li><strong>AWS Billing Conductor</strong> creates custom pricing and pro forma bills for showback/chargeback (for example resellers or internal business units).</li>
</ul>`
            },
            {
              heading: 'Choosing purchase models',
              html: `<table><thead><tr><th>Model</th><th>Flexibility</th><th>Applies to</th><th>Best for</th></tr></thead><tbody>
<tr><td>Compute Savings Plans</td><td>Any instance family, size, Region, OS, tenancy</td><td>EC2, Fargate, Lambda</td><td>Steady baseline across a changing estate</td></tr>
<tr><td>EC2 Instance Savings Plans</td><td>Fixed family in one Region; any size/OS</td><td>EC2</td><td>Larger discount when the family is stable</td></tr>
<tr><td>Reserved Instances</td><td>Standard or convertible</td><td>EC2, RDS, ElastiCache, OpenSearch, Redshift, and others</td><td>Database and non-compute services Savings Plans do not cover</td></tr>
<tr><td>On-Demand Capacity Reservations</td><td>No discount by itself</td><td>EC2 in a specific AZ</td><td>Guaranteed capacity for DR or events; combine with Savings Plans for discount</td></tr>
<tr><td>Spot</td><td>Can be interrupted with two-minute notice</td><td>EC2, Fargate Spot</td><td>Fault-tolerant, stateless, batch, CI</td></tr>
</tbody></table>
<div class="callout warn">Savings Plans and RIs do not reserve capacity (except zonal RIs). If the requirement is "guarantee capacity in a specific AZ", you need On-Demand Capacity Reservations.</div>`
            },
            {
              heading: 'Visibility: CUR, tags and anomaly detection',
              html: `<ul>
<li><strong>Cost and Usage Report (CUR 2.0) via AWS Data Exports</strong> delivers line-item data to S3 in Parquet; query it with Athena and visualize with QuickSight (Cloud Intelligence Dashboards).</li>
<li><strong>Cost allocation tags</strong> must be <em>activated</em> in the management account before they appear in billing data; they are not retroactive.</li>
<li><strong>Tag policies</strong> in Organizations standardize tag keys and values; combine with SCPs that deny resource creation without required tags (via <code>aws:RequestTag</code>) for enforcement.</li>
<li><strong>AWS Cost Categories</strong> group cost by rules (accounts, tags) into business units.</li>
<li><strong>AWS Budgets</strong> with budget actions (apply an SCP or IAM policy, stop instances) and <strong>Cost Anomaly Detection</strong> for ML-based spend spikes.</li>
</ul>`
            },
            {
              heading: 'Optimizing an existing workload',
              html: `<ul>
<li><strong>Right-size first</strong> (Compute Optimizer), then commit (Savings Plans) – otherwise you lock in waste.</li>
<li>Move to <strong>Graviton</strong> instances for price/performance where the software supports Arm.</li>
<li><strong>Storage:</strong> S3 Intelligent-Tiering for unknown access patterns, lifecycle to Glacier tiers for archives, gp2 → gp3 EBS migration, delete unattached volumes and old snapshots.</li>
<li><strong>Data transfer:</strong> keep chatty traffic in one AZ where safe, use gateway endpoints instead of NAT for S3/DynamoDB, and CloudFront to reduce origin egress.</li>
<li>Schedule non-production resources off outside working hours (Instance Scheduler).</li>
</ul>`
            },
            {
              heading: 'Reference scenario',
              html: `<p><strong>Scenario:</strong> a company with 120 accounts sees EC2 spend rising, cannot attribute 30% of costs to teams, and one acquired business must keep its own discount benefits isolated.</p>
<ul>
<li>Enforce <code>CostCenter</code> tagging via tag policies plus a deny-without-tag SCP; activate the tag as a cost allocation tag; build Cost Categories per business unit.</li>
<li>Run Compute Optimizer, right-size, then buy Compute Savings Plans in the management or a dedicated billing account to cover the new baseline.</li>
<li>Turn off RI/Savings Plans discount sharing for the acquired business's accounts.</li>
</ul>`
            }
          ],
          keyPoints: [
            `Consolidated billing shares RI/Savings Plans discounts org-wide by default; sharing can be disabled per account.`,
            `Compute Savings Plans cover EC2, Fargate and Lambda across Regions and families.`,
            `Capacity Reservations guarantee capacity; Savings Plans only discount.`,
            `Cost allocation tags must be activated in the management account and are not retroactive.`,
            `CUR 2.0 via Data Exports + Athena/QuickSight for detailed analysis.`,
            `Right-size before committing; then Graviton, storage tiering and data transfer fixes.`
          ],
          examTips: [
            `If the workload changes instance families or moves to Fargate/Lambda, Compute Savings Plans beat EC2 Instance Savings Plans and RIs.`,
            `If a team's tags do not appear in Cost Explorer, think "activate cost allocation tags in the management account".`,
            `If a subsidiary must not receive shared discounts, think disabling RI/Savings Plans sharing for those accounts.`,
            `If the question needs line-item cost analysis with SQL, think CUR (Data Exports) + Athena.`
          ],
          services: ['AWS Organizations', 'Savings Plans', 'AWS Cost Explorer', 'AWS Data Exports (CUR 2.0)', 'AWS Budgets', 'AWS Cost Anomaly Detection', 'AWS Compute Optimizer', 'AWS Billing Conductor']
        },
        {
          id: 'p-deployment-strategies',
          title: 'Deployment Strategies: Blue/Green, Canary, CodeDeploy & StackSets',
          minutes: 15,
          summary: `Reduce change risk with the right deployment pattern and roll infrastructure out consistently across hundreds of accounts and Regions.`,
          sections: [
            {
              heading: 'Deployment patterns compared',
              html: `<table><thead><tr><th>Pattern</th><th>Rollback speed</th><th>Extra capacity</th><th>Risk exposure</th></tr></thead><tbody>
<tr><td>All-at-once / in-place</td><td>Slow (redeploy)</td><td>None</td><td>All users</td></tr>
<tr><td>Rolling (with additional batch)</td><td>Medium</td><td>Small</td><td>Growing share of users</td></tr>
<tr><td>Blue/green</td><td>Instant (switch back)</td><td>Full duplicate environment</td><td>All users at cutover, unless combined with canary</td></tr>
<tr><td>Canary</td><td>Fast</td><td>Small</td><td>Small percentage first, then the rest</td></tr>
<tr><td>Linear</td><td>Fast</td><td>Small</td><td>Equal increments over time</td></tr>
<tr><td>Feature flags (AppConfig)</td><td>Instant (toggle)</td><td>None</td><td>Targeted users</td></tr>
</tbody></table>`
            },
            {
              heading: 'CodeDeploy and native options',
              html: `<ul>
<li><strong>EC2/on-premises</strong>: in-place or blue/green (new Auto Scaling group behind the load balancer).</li>
<li><strong>Lambda</strong>: shifts alias traffic between versions with canary, linear or all-at-once configurations, with pre/post traffic hooks and automatic rollback on CloudWatch alarms.</li>
<li><strong>ECS</strong>: blue/green with two target groups; ECS also has native blue/green deployments with lifecycle hooks, as well as rolling updates with the deployment circuit breaker for automatic rollback.</li>
<li><strong>API Gateway</strong> canary release settings on a stage; <strong>ALB weighted target groups</strong> and <strong>Route 53 weighted records</strong> for traffic splitting.</li>
<li><strong>Database changes</strong> are the hard part of blue/green: use backward-compatible schema changes (expand/contract), or <strong>RDS Blue/Green Deployments</strong> for engine upgrades with a managed switchover.</li>
</ul>`
            },
            {
              heading: 'Infrastructure at scale: CloudFormation StackSets',
              html: `<ul>
<li>StackSets deploy one template to many accounts and Regions. With <strong>service-managed permissions</strong> (Organizations integration), it creates the required roles for you and can <strong>automatically deploy to new accounts</strong> added to target OUs.</li>
<li>Control rollout with <strong>maximum concurrent accounts</strong>, <strong>failure tolerance</strong> and Region order; run from a <strong>delegated administrator</strong> account.</li>
<li>Use <strong>change sets</strong> and drift detection on stacks; CloudFormation Guard or Hooks to block noncompliant templates.</li>
<li>Pipelines: CodePipeline with cross-account deploy roles; artifacts encrypted with a customer managed KMS key shared to target accounts.</li>
</ul>
<div class="callout warn">Self-managed StackSets permissions require you to create the administration and execution roles in every account and do not auto-deploy to new accounts. For org-wide baselines, service-managed is the exam answer.</div>`
            },
            {
              heading: 'Reference scenario',
              html: `<p><strong>Scenario:</strong> a company deploys a Lambda-based API weekly and suffered an outage when a bad release went to 100% of traffic; it also needs an IAM baseline role in every current and future account.</p>
<ul>
<li>Use CodeDeploy with <code>LambdaCanary10Percent5Minutes</code>, a CloudWatch alarm on 5xx errors, and automatic rollback.</li>
<li>Deploy the baseline role with a service-managed StackSet targeting the root OU with automatic deployment enabled, run from a delegated admin account.</li>
</ul>`
            }
          ],
          keyPoints: [
            `Blue/green gives instant rollback at the cost of duplicate capacity.`,
            `Canary/linear limit blast radius; combine with alarm-based automatic rollback.`,
            `CodeDeploy supports EC2/on-prem, Lambda and ECS deployments.`,
            `Database schema changes must be backward compatible for safe blue/green.`,
            `Service-managed StackSets auto-deploy to new accounts in target OUs.`,
            `RDS Blue/Green Deployments simplify database engine upgrades.`
          ],
          examTips: [
            `If a deployment must expose only a small percentage of users first and roll back automatically, think CodeDeploy canary with CloudWatch alarms.`,
            `If a resource must exist in every new account automatically, think service-managed StackSets with auto-deployment (or Control Tower customizations).`,
            `If the question needs a fast, low-risk major version upgrade of an RDS database, think RDS Blue/Green Deployments.`,
            `If rollback must be instant without redeploying, think blue/green or feature flags.`
          ],
          services: ['AWS CodeDeploy', 'AWS CodePipeline', 'AWS CloudFormation StackSets', 'AWS AppConfig', 'Amazon ECS', 'AWS Lambda', 'Amazon RDS Blue/Green Deployments']
        }
      ]
    },
    // =====================================================================
    // DOMAIN 4 — MIGRATION & MODERNIZATION
    // =====================================================================
    {
      id: 'migrate',
      name: 'Accelerate Workload Migration and Modernization',
      weight: 20,
      summary: `Assess a portfolio, choose a migration strategy per application, move servers, databases and bulk data with the right tools, and modernize toward containers, serverless and managed databases.`,
      lessons: [
        {
          id: 'p-migration-strategy',
          title: 'Portfolio Assessment & the 7 Rs',
          minutes: 14,
          summary: `Discover the estate, group applications into waves, and assign each one the cheapest strategy that meets the business goal.`,
          sections: [
            {
              heading: 'The 7 Rs',
              html: `<table><thead><tr><th>Strategy</th><th>What changes</th><th>Typical trigger</th></tr></thead><tbody>
<tr><td>Retire</td><td>Decommission</td><td>No business value; duplicated capability</td></tr>
<tr><td>Retain</td><td>Stays where it is (for now)</td><td>Recent hardware investment, compliance, or not ready</td></tr>
<tr><td>Rehost ("lift and shift")</td><td>Same OS and app on EC2</td><td>Data center exit deadline; fastest at scale (Application Migration Service)</td></tr>
<tr><td>Relocate</td><td>Hypervisor-level move</td><td>VMware estate to VMware Cloud on AWS or Amazon Elastic VMware Service</td></tr>
<tr><td>Repurchase</td><td>Move to SaaS</td><td>Commodity CRM/HR/email</td></tr>
<tr><td>Replatform ("lift, tinker and shift")</td><td>Minor optimizations, no code redesign</td><td>Self-managed DB → RDS; app server → Elastic Beanstalk or containers</td></tr>
<tr><td>Refactor / re-architect</td><td>Redesign for cloud-native</td><td>Scale, agility or cost needs that the current architecture cannot meet</td></tr>
</tbody></table>
<div class="callout">Exam scenarios with a hard deadline (lease expiry in months) almost always favor <strong>rehost first, modernize later</strong>. Refactoring is reserved for cases where the business explicitly needs new capabilities.</div>`
            },
            {
              heading: 'Discovery and planning tools',
              html: `<ul>
<li><strong>AWS Application Discovery Service</strong>: the <em>Agentless Collector</em> (VMware vCenter) gathers VM inventory and utilization; the <em>Discovery Agent</em> adds process-level data and <strong>network dependencies</strong> on physical or non-VMware servers.</li>
<li><strong>AWS Migration Hub</strong>: single place to track migration status across tools, with network visualization of discovered dependencies and EC2 instance recommendations.</li>
<li><strong>Migration Evaluator</strong>: builds a directional business case (TCO) from utilization data, including licensing optimization.</li>
<li><strong>AWS Transform</strong> (agentic AI, 2025) accelerates VMware, .NET, mainframe and other modernization assessments and conversions; treat it as an accelerator on top of the classic discovery and migration services.</li>
<li><strong>AWS Migration Acceleration Program (MAP)</strong>: assess, mobilize, migrate-and-modernize phases with funding and partner support.</li>
</ul>`
            },
            {
              heading: 'Wave planning and the landing zone',
              html: `<ul>
<li>Group servers into <strong>move groups</strong> by application dependency so that chatty components move together and cross-network latency does not break them.</li>
<li>Build the landing zone (Control Tower, networking, Identity Center) during the <strong>mobilize</strong> phase, before the first wave.</li>
<li>Run pilot waves with low-risk applications to tune runbooks, then industrialize ("migration factory").</li>
<li>Plan licensing: Dedicated Hosts for socket/core-bound licenses (for example some Windows Server and SQL Server BYOL), License Manager to track usage.</li>
</ul>`
            },
            {
              heading: 'Reference scenario',
              html: `<p><strong>Scenario:</strong> a retailer must vacate a data center in nine months: 1,200 VMware VMs, 200 physical Linux servers, 40 Oracle and SQL Server databases, and a mainframe that must stay for two more years.</p>
<ul>
<li>Agentless Collector for VMware plus Discovery Agents on physical servers to map dependencies; track in Migration Hub.</li>
<li>Retire roughly 10% (unused), rehost most servers with MGN in dependency-based waves, replatform databases to RDS/Aurora with DMS, retain the mainframe and connect it over Direct Connect.</li>
<li>Schedule refactoring of the top revenue application after the exit date.</li>
</ul>`
            }
          ],
          keyPoints: [
            `7 Rs: retire, retain, rehost, relocate, repurchase, replatform, refactor.`,
            `Hard deadline + large estate = rehost first, then modernize.`,
            `Application Discovery Service agent captures network dependencies; agentless collector covers VMware inventory.`,
            `Migration Hub tracks migrations across tools; Migration Evaluator builds the business case.`,
            `Move dependent servers together in waves to avoid latency between environments.`,
            `Dedicated Hosts address socket/core-based BYOL licensing.`
          ],
          examTips: [
            `If the question requires "server dependencies and network connections", think Application Discovery Service Agent (not only the agentless collector).`,
            `If the goal is "minimal changes, fastest migration", think rehost with Application Migration Service.`,
            `If the question moves a database to a managed service without code changes, think replatform.`,
            `If VMware tooling and operations must be preserved, think relocate (VMware Cloud on AWS or Amazon EVS).`
          ],
          services: ['AWS Application Discovery Service', 'AWS Migration Hub', 'Migration Evaluator', 'AWS Transform', 'AWS License Manager']
        },
        {
          id: 'p-server-database-migration',
          title: 'Server & Database Migration: Application Migration Service, DMS & SCT',
          minutes: 18,
          summary: `Rehost servers with continuous block replication and move databases with minimal downtime, including heterogeneous engine conversions.`,
          sections: [
            {
              heading: 'AWS Application Migration Service (MGN)',
              html: `<ul>
<li>Install the <strong>AWS Replication Agent</strong> on source servers (physical, VMware, Hyper-V, other clouds). It performs <strong>continuous block-level replication</strong> to lightweight replication servers in a <strong>staging area subnet</strong>, using low-cost EBS volumes.</li>
<li>Launch <strong>test instances</strong> non-disruptively, then a <strong>cutover</strong> with downtime limited to the final sync and DNS change (typically minutes).</li>
<li>Launch templates control instance type, subnet and security groups; <strong>post-launch actions</strong> can install agents, run SSM documents or convert licenses.</li>
<li>Replication traffic can flow over Direct Connect or VPN using private IPs, and is encrypted in transit.</li>
<li>MGN replaced CloudEndure Migration and Server Migration Service as the recommended rehost tool.</li>
</ul>`
            },
            {
              heading: 'AWS DMS and schema conversion',
              html: `<table><thead><tr><th>Scenario</th><th>Tooling</th></tr></thead><tbody>
<tr><td>Homogeneous (MySQL → Aurora MySQL, PostgreSQL → RDS PostgreSQL)</td><td>Native tools (dump/restore, native replication) or DMS homogeneous data migrations; no schema conversion needed</td></tr>
<tr><td>Heterogeneous (Oracle → Aurora PostgreSQL, SQL Server → Aurora MySQL)</td><td><strong>DMS Schema Conversion</strong> (in console) or <strong>AWS SCT</strong> to convert schema and code, then DMS for data</td></tr>
<tr><td>Minimal downtime</td><td>DMS <strong>full load + CDC</strong> (ongoing replication), then cutover</td></tr>
<tr><td>Data warehouse (Teradata, Netezza, Oracle DW → Redshift)</td><td>SCT with data extraction agents</td></tr>
<tr><td>Very large database over a slow link</td><td>SCT/DMS with Snowball Edge for the bulk load, then CDC over the network</td></tr>
</tbody></table>
<ul>
<li>SCT produces an <strong>assessment report</strong> showing what converts automatically and what needs manual effort (stored procedures, proprietary features).</li>
<li>DMS supports <strong>validation</strong> of migrated data, LOB modes, and <strong>DMS Serverless</strong> to auto-provision capacity.</li>
<li>Sources needing CDC must have logging enabled (for example Oracle supplemental logging, MySQL binlog in ROW format).</li>
</ul>
<div class="callout warn">DMS migrates data, tables and primary keys – it does not convert stored procedures, triggers or secondary objects in heterogeneous migrations. That is the job of SCT or DMS Schema Conversion.</div>`
            },
            {
              heading: 'Cutover planning',
              html: `<ul>
<li>Lower DNS TTLs days before cutover; keep the source read-only during the final sync.</li>
<li>For databases, stop writes, let CDC latency reach zero, validate, switch connection strings, and keep reverse replication or the source available for rollback.</li>
<li>Use MGN's test launches to run application smoke tests in an isolated subnet before the real cutover.</li>
</ul>`
            },
            {
              heading: 'Reference scenario',
              html: `<p><strong>Scenario:</strong> a 6 TB Oracle OLTP database must move to Aurora PostgreSQL with less than 15 minutes of downtime; 300 application servers must be rehosted.</p>
<ul>
<li>Run DMS Schema Conversion (or SCT) to convert schema and PL/SQL; remediate items flagged in the assessment report.</li>
<li>DMS full load + CDC from Oracle (supplemental logging enabled) to Aurora PostgreSQL over Direct Connect; validation tasks enabled.</li>
<li>Rehost app servers with MGN; cut over in waves aligned to the database cutover window.</li>
</ul>`
            }
          ],
          keyPoints: [
            `MGN: agent-based continuous block replication, staging subnet, test then cutover.`,
            `DMS full load + CDC minimizes downtime.`,
            `Heterogeneous migrations need SCT or DMS Schema Conversion for schema and code.`,
            `SCT assessment report quantifies manual conversion effort.`,
            `Snowball Edge can carry the bulk of a huge database; DMS CDC catches up afterward.`,
            `Enable source logging (supplemental logging, binlog) for CDC.`
          ],
          examTips: [
            `If the question says "rehost hundreds of servers with minimal downtime", think Application Migration Service.`,
            `If it says "Oracle to PostgreSQL" or another engine change, the answer includes SCT/DMS Schema Conversion plus DMS.`,
            `If it says "keep source and target in sync until cutover", think DMS CDC.`,
            `If network bandwidth cannot carry a multi-TB database in time, think Snowball Edge with DMS.`
          ],
          services: ['AWS Application Migration Service', 'AWS Database Migration Service', 'AWS Schema Conversion Tool', 'DMS Schema Conversion', 'AWS Snowball Edge', 'Amazon Aurora']
        },
        {
          id: 'p-data-transfer',
          title: 'Large-Scale Data Transfer: DataSync, Snow Family, Transfer Family & the Math',
          minutes: 15,
          summary: `Calculate whether the network can move the data in time, then pick online or offline transfer tools accordingly.`,
          sections: [
            {
              heading: 'Do the math first',
              html: `<p>Convert bandwidth to bytes: <strong>1 Gbps ≈ 125 MB/s ≈ 10.8 TB per day</strong> at 100% utilization. Real-world, plan on roughly 70–80% utilization.</p>
<table><thead><tr><th>Data</th><th>100 Mbps</th><th>1 Gbps</th><th>10 Gbps</th></tr></thead><tbody>
<tr><td>10 TB</td><td>~9–10 days</td><td>~1 day</td><td>~2–3 hours</td></tr>
<tr><td>100 TB</td><td>~3 months</td><td>~9–10 days</td><td>~1 day</td></tr>
<tr><td>1 PB</td><td>~2.5 years</td><td>~3 months</td><td>~9–10 days</td></tr>
</tbody></table>
<p>(Figures assume full utilization; add 20–30% for real links.) If the transfer time exceeds the deadline, or saturating the link would harm production, go offline with Snowball Edge, or provision more bandwidth (a new DX connection can take weeks to months).</p>`
            },
            {
              heading: 'Online transfer tools',
              html: `<table><thead><tr><th>Tool</th><th>Use case</th></tr></thead><tbody>
<tr><td>AWS DataSync</td><td>Bulk or recurring copies from NFS, SMB, HDFS, object storage and other clouds into S3, EFS or FSx; handles encryption, integrity verification, scheduling, bandwidth throttling and metadata preservation</td></tr>
<tr><td>AWS Storage Gateway</td><td>Ongoing hybrid access: S3 File Gateway (NFS/SMB into S3), Volume Gateway (iSCSI), Tape Gateway (virtual tape library replacing physical tape)</td></tr>
<tr><td>AWS Transfer Family</td><td>Managed SFTP, FTPS, FTP and AS2 endpoints into S3 or EFS for partners; custom identity providers; Transfer Family web apps for browser access</td></tr>
<tr><td>S3 Transfer Acceleration</td><td>Faster long-distance uploads to S3 via edge locations</td></tr>
<tr><td>S3 Replication / Batch Operations</td><td>Copying between buckets, accounts and Regions</td></tr>
</tbody></table>
<p>A DataSync <strong>agent</strong> runs near the source (VM or EC2) and can use a VPC endpoint over DX for private transfer. Use DataSync for the migration and <strong>File Gateway</strong> when users still need ongoing local file access afterward.</p>`
            },
            {
              heading: 'Offline transfer: Snowball Edge',
              html: `<ul>
<li><strong>Snowball Edge Storage Optimized</strong> devices carry tens to a couple of hundred terabytes each; order multiple devices in parallel for petabyte scale. Data is encrypted with KMS keys and the device is tamper-evident.</li>
<li><strong>Snowball Edge Compute Optimized</strong> adds edge compute for disconnected sites.</li>
<li>Snowmobile and Snowcone have been retired, so petabyte-scale offline answers today use multiple Snowball Edge devices (or more network bandwidth).</li>
<li>End-to-end time includes shipping and ingestion – typically about a week per round trip – so offline wins mainly when network time would be weeks or more.</li>
</ul>`
            },
            {
              heading: 'Reference scenario',
              html: `<p><strong>Scenario:</strong> a research institute has 600 TB on NAS, a shared 1 Gbps internet link that cannot exceed 50% use during business hours, and must finish in six weeks. New files arrive daily.</p>
<ul>
<li>At ~50% of 1 Gbps, the network moves ~5 TB per day: 600 TB would take ~4 months – too slow.</li>
<li>Ship the bulk on several Snowball Edge Storage Optimized devices in parallel.</li>
<li>Use DataSync with bandwidth throttling (scheduled for higher limits at night) to transfer changes made after the devices were loaded, then a final incremental sync at cutover.</li>
</ul>`
            }
          ],
          keyPoints: [
            `1 Gbps ≈ 10.8 TB/day at full utilization; 100 TB ≈ 9–10 days on 1 Gbps.`,
            `DataSync for bulk/recurring online copies with verification and throttling.`,
            `Storage Gateway for ongoing hybrid access; Tape Gateway replaces physical tape.`,
            `Transfer Family provides managed SFTP/FTPS/FTP/AS2 into S3 or EFS.`,
            `Snowball Edge for offline bulk; combine with DataSync for the delta.`,
            `Snowmobile and Snowcone are retired.`
          ],
          examTips: [
            `If the calculated network transfer time exceeds the deadline, think Snowball Edge (multiple devices in parallel).`,
            `If partners must keep using SFTP while data lands in S3, think Transfer Family.`,
            `If a one-time NFS/SMB migration needs integrity verification and scheduling, think DataSync.`,
            `If on-prem apps need continued local file access backed by S3, think S3 File Gateway.`
          ],
          services: ['AWS DataSync', 'AWS Snowball Edge', 'AWS Storage Gateway', 'AWS Transfer Family', 'Amazon S3 Transfer Acceleration']
        },
        {
          id: 'p-modernization',
          title: 'Modernization Paths: Containers, Serverless, Databases & Mainframes',
          minutes: 16,
          summary: `Modernize incrementally with the strangler fig pattern, move to containers or serverless where it pays off, and choose purpose-built databases and mainframe paths.`,
          sections: [
            {
              heading: 'Incremental modernization',
              html: `<ul>
<li><strong>Strangler fig pattern:</strong> put a routing layer (API Gateway, ALB path rules, or CloudFront behaviors) in front of the monolith, then carve out capabilities one by one into new services until the monolith can be retired.</li>
<li><strong>Anti-corruption layer</strong> translates between old and new models so the new services stay clean.</li>
<li>Decompose by business capability; give each service its own data store and integrate through events (EventBridge, SNS/SQS) rather than shared tables.</li>
</ul>`
            },
            {
              heading: 'To containers or serverless',
              html: `<table><thead><tr><th>Starting point</th><th>Modernization target</th><th>Notes</th></tr></thead><tbody>
<tr><td>Java/.NET app on VMs</td><td>Containers on ECS/EKS (Fargate)</td><td>AWS App2Container can containerize existing Java and .NET apps; AWS Transform helps port .NET Framework to cross-platform .NET</td></tr>
<tr><td>Cron jobs and scripts</td><td>EventBridge Scheduler + Lambda or Step Functions</td><td>Eliminates idle servers</td></tr>
<tr><td>Batch jobs</td><td>AWS Batch or Step Functions Distributed Map</td><td>Use Spot for cost</td></tr>
<tr><td>Web app with spiky traffic</td><td>Lambda + API Gateway, or App Runner/ECS</td><td>Consider Lambda limits (15-minute max duration)</td></tr>
<tr><td>Self-managed message broker</td><td>Amazon MQ (ActiveMQ/RabbitMQ protocol compatibility) or SQS/SNS when redesigning</td><td>Amazon MQ avoids rewriting clients</td></tr>
</tbody></table>`
            },
            {
              heading: 'Database modernization',
              html: `<ul>
<li>Commercial engines to <strong>Aurora PostgreSQL/MySQL</strong> to remove licensing costs (SCT/DMS Schema Conversion + DMS). <strong>Babelfish for Aurora PostgreSQL</strong> understands T-SQL and the SQL Server wire protocol, reducing application changes for SQL Server migrations.</li>
<li>Keep Oracle or SQL Server on <strong>RDS</strong> (replatform) when the app depends on proprietary features; <strong>RDS Custom</strong> when you need OS or database customization access.</li>
<li>Purpose-built: DynamoDB for key-value at scale, DocumentDB for MongoDB-compatible workloads, ElastiCache/MemoryDB for in-memory, Neptune for graph, Timestream for time series, OpenSearch for search, Redshift for warehousing.</li>
</ul>`
            },
            {
              heading: 'Mainframe modernization',
              html: `<table><thead><tr><th>Path</th><th>What happens</th></tr></thead><tbody>
<tr><td>Retain + integrate</td><td>Keep the mainframe; expose data via replication or APIs to new AWS services</td></tr>
<tr><td>Replatform</td><td>Recompile COBOL/PL/I to run on AWS with a compatible runtime (for example the Rocket Software runtime) via AWS Mainframe Modernization</td></tr>
<tr><td>Automated refactor</td><td>Convert COBOL to Java with AWS Blu Age tooling, now available through AWS Transform for mainframe</td></tr>
<tr><td>Data replication</td><td>Mainframe data replication tools (for example Precisely) stream changes to AWS for analytics</td></tr>
</tbody></table>`
            },
            {
              heading: 'Reference scenario',
              html: `<p><strong>Scenario:</strong> an insurer runs a 12-year-old monolithic Java claims app on WebLogic with an Oracle database, licensing costs are rising, and the business wants faster feature delivery without a big-bang rewrite.</p>
<ul>
<li>Rehost/replatform first: containerize the app onto ECS on Fargate; keep Oracle on RDS initially.</li>
<li>Put API Gateway in front and strangle out the claims-intake capability as Lambda + DynamoDB services, publishing events to EventBridge.</li>
<li>Later convert the remaining schema to Aurora PostgreSQL with SCT/DMS to remove Oracle licensing.</li>
</ul>`
            }
          ],
          keyPoints: [
            `Strangler fig: route traffic through a façade and peel off capabilities incrementally.`,
            `App2Container containerizes existing Java/.NET apps; AWS Transform assists .NET and mainframe modernization.`,
            `Amazon MQ preserves ActiveMQ/RabbitMQ protocols without client rewrites.`,
            `Babelfish for Aurora PostgreSQL reduces SQL Server application changes.`,
            `RDS Custom gives OS/database customization when managed RDS is too restrictive.`,
            `Mainframe paths: retain, replatform (compatible runtime), automated refactor (Blu Age), or data replication.`
          ],
          examTips: [
            `If the question says "modernize incrementally without a big-bang rewrite", think strangler fig with API Gateway or ALB routing.`,
            `If on-prem apps use JMS/AMQP with ActiveMQ and must migrate quickly, think Amazon MQ, not SQS.`,
            `If a SQL Server app must move to an open-source engine with minimal code change, think Babelfish for Aurora PostgreSQL.`,
            `If a vendor app needs OS-level access on a managed database, think RDS Custom.`
          ],
          services: ['Amazon ECS', 'AWS Lambda', 'AWS App2Container', 'Amazon MQ', 'Babelfish for Aurora PostgreSQL', 'Amazon RDS Custom', 'AWS Mainframe Modernization', 'AWS Transform']
        }
      ]
    }
  ],
  // =======================================================================
  // FLASHCARDS
  // =======================================================================
  flashcards: [
    // org
    { domain: 'org', front: `Which account is never affected by SCPs or RCPs?`, back: `The <b>management account</b>. Service-linked roles are also unaffected.` },
    { domain: 'org', front: `SCP vs RCP in one sentence`, back: `SCPs limit what <b>your principals</b> can do; RCPs limit what <b>anyone</b> can do to <b>your resources</b> (supported services such as S3, STS, KMS, SQS, Secrets Manager).` },
    { domain: 'org', front: `Condition key to restrict a resource to principals in your organization`, back: `<b>aws:PrincipalOrgID</b> (in an RCP or resource policy).` },
    { domain: 'org', front: `Condition key to stop your principals from using resources outside your organization`, back: `<b>aws:ResourceOrgID</b> (in an SCP).` },
    { domain: 'org', front: `Three Control Tower control behaviors and their implementation`, back: `Preventive = SCPs/RCPs; Detective = AWS Config rules; Proactive = CloudFormation Hooks.` },
    { domain: 'org', front: `AFT`, back: `<b>Account Factory for Terraform</b>: GitOps pipeline for vending and customizing Control Tower accounts with Terraform.` },
    { domain: 'org', front: `How does IAM Identity Center integrate with Okta or Entra ID?`, back: `<b>SAML 2.0</b> for authentication and <b>SCIM</b> for automatic user and group provisioning.` },
    { domain: 'org', front: `What protects against the confused deputy problem when a vendor assumes a role in your account?`, back: `An <b>sts:ExternalId</b> condition in the role trust policy.` },
    { domain: 'org', front: `Name four resource types commonly shared with AWS RAM`, back: `VPC subnets, Transit Gateways, Route 53 Resolver rules, prefix lists (also IPAM pools, Network Firewall policies, License Manager configurations).` },
    { domain: 'org', front: `TGW association vs propagation`, back: `An attachment is <b>associated</b> with one route table (used for its outbound lookups) and can <b>propagate</b> its routes into many route tables.` },
    { domain: 'org', front: `Direct Connect Maximum Resiliency model`, back: `Separate connections on separate devices in <b>at least two DX locations</b>, so a full location failure leaves enough capacity.` },
    { domain: 'org', front: `Three ways to encrypt traffic over Direct Connect`, back: `MACsec (supported dedicated connections), Site-to-Site VPN over a public VIF, Private IP VPN over a transit VIF to a TGW.` },
    { domain: 'org', front: `Route 53 Resolver inbound vs outbound endpoint`, back: `<b>Inbound</b>: on-prem resolvers forward queries for AWS names to it. <b>Outbound</b>: with forwarding rules, sends AWS-originated queries for on-prem domains to on-prem DNS.` },
    { domain: 'org', front: `Protocol and port used by Gateway Load Balancer`, back: `<b>GENEVE</b> on UDP port <b>6081</b>.` },
    { domain: 'org', front: `Why enable TGW appliance mode?`, back: `To keep both directions of a flow on the same AZ appliance, so stateful firewalls in an inspection VPC do not drop asymmetric return traffic.` },
    // new
    { domain: 'new', front: `Aurora Global Database: how many writer Regions?`, back: `<b>One</b> primary writer Region; secondaries are read-only (write forwarding can relay writes to the primary).` },
    { domain: 'new', front: `DynamoDB global tables default conflict resolution`, back: `<b>Last writer wins</b>, with asynchronous replication between Regions.` },
    { domain: 'new', front: `What gives DynamoDB global tables an RPO of zero?`, back: `<b>Multi-Region strong consistency (MRSC)</b> mode, deployed across three Regions (or two plus a witness).` },
    { domain: 'new', front: `Four DR strategies from cheapest to most expensive`, back: `Backup &amp; restore, pilot light, warm standby, multi-site active/active.` },
    { domain: 'new', front: `Why use Route 53 ARC routing controls for failover?`, back: `They are switched through a highly available multi-Region data plane, with safety rules, so failover does not depend on the impaired Region's control plane.` },
    { domain: 'new', front: `Step Functions Standard vs Express maximum duration`, back: `Standard: up to <b>one year</b>. Express: up to <b>five minutes</b>.` },
    { domain: 'new', front: `How to get ordering per customer with SQS while scaling out?`, back: `SQS FIFO with <b>MessageGroupId = customer ID</b> (high-throughput mode for more scale).` },
    { domain: 'new', front: `Kinesis Data Streams per-shard ingest limit`, back: `<b>1 MB/s or 1,000 records/s</b> in; 2 MB/s out (shared), or 2 MB/s per consumer with enhanced fan-out.` },
    { domain: 'new', front: `Recommended SQS visibility timeout when Lambda is the consumer`, back: `At least <b>six times</b> the Lambda function timeout.` },
    { domain: 'new', front: `When does DAX not help?`, back: `For <b>strongly consistent reads</b> (they pass through to DynamoDB) and write-heavy workloads.` },
    { domain: 'new', front: `Fixing pod IP exhaustion on EKS`, back: `VPC CNI <b>prefix delegation</b> or <b>custom networking</b> with secondary CIDRs (for example 100.64.0.0/10).` },
    { domain: 'new', front: `KMS multi-Region keys`, back: `Primary + replica keys with the <b>same key ID and material</b> in different Regions; each has its own key policy. Decrypt locally without cross-Region calls.` },
    { domain: 'new', front: `KMS custom key store`, back: `KMS keys whose material lives in <b>your CloudHSM cluster</b> (or an external key manager for XKS), while services still use the normal KMS API.` },
    { domain: 'new', front: `Why does cross-account access to SSE-KMS objects fail with the aws/s3 key?`, back: `AWS managed keys have key policies you cannot change, so they <b>cannot be shared cross-account</b>. Use a customer managed key.` },
    { domain: 'new', front: `Object Lock governance vs compliance mode`, back: `Governance: users with <b>s3:BypassGovernanceRetention</b> can delete. Compliance: <b>nobody</b>, including root, can delete or shorten retention.` },
    // improve
    { domain: 'improve', front: `Central monitoring across many accounts with least effort`, back: `<b>CloudWatch cross-account observability</b>: link source accounts to a monitoring account (via Organizations).` },
    { domain: 'improve', front: `Fix for Lambda functions exhausting RDS connections`, back: `<b>Amazon RDS Proxy</b> (connection pooling and multiplexing).` },
    { domain: 'improve', front: `Static stability`, back: `The system keeps working during an impairment <b>without control-plane actions</b> (for example, capacity already provisioned in the remaining AZs).` },
    { domain: 'improve', front: `FIS stop condition`, back: `A <b>CloudWatch alarm</b> that automatically halts an experiment if it breaches.` },
    { domain: 'improve', front: `What does AWS Resilience Hub do?`, back: `Assesses an application against defined <b>RTO/RPO</b> targets, recommends improvements, and can generate alarms, SOPs and FIS experiments.` },
    { domain: 'improve', front: `Six Well-Architected pillars`, back: `Operational excellence, security, reliability, performance efficiency, cost optimization, sustainability.` },
    { domain: 'improve', front: `Compute Savings Plans cover…`, back: `<b>EC2</b> (any family, size, Region, OS, tenancy), <b>Fargate</b> and <b>Lambda</b>.` },
    { domain: 'improve', front: `Do Savings Plans guarantee capacity?`, back: `No. Use <b>On-Demand Capacity Reservations</b> (or zonal RIs) to reserve capacity in an AZ.` },
    { domain: 'improve', front: `Why do user-defined tags not appear in Cost Explorer?`, back: `They must be <b>activated as cost allocation tags</b> in the management (payer) account, and are not retroactive.` },
    { domain: 'improve', front: `How to stop a subsidiary account receiving shared RI/Savings Plans discounts?`, back: `Turn off <b>discount sharing</b> for that account in the management account billing preferences.` },
    { domain: 'improve', front: `CodeDeploy Lambda deployment configurations`, back: `<b>Canary</b>, <b>linear</b> and <b>all-at-once</b> traffic shifting on an alias, with alarm-based automatic rollback.` },
    { domain: 'improve', front: `StackSets permission model that auto-deploys to new accounts`, back: `<b>Service-managed</b> permissions (Organizations integration) with automatic deployment enabled for target OUs.` },
    { domain: 'improve', front: `Fast, low-risk RDS major version upgrade`, back: `<b>RDS Blue/Green Deployments</b>: a synchronized staging copy, then managed switchover.` },
    // migrate
    { domain: 'migrate', front: `List the 7 Rs`, back: `Retire, Retain, Rehost, Relocate, Repurchase, Replatform, Refactor.` },
    { domain: 'migrate', front: `Which discovery option captures network dependencies on physical servers?`, back: `The <b>Application Discovery Service Discovery Agent</b> installed on each server.` },
    { domain: 'migrate', front: `How does Application Migration Service replicate servers?`, back: `An agent performs <b>continuous block-level replication</b> to replication servers in a staging subnet; you launch test instances, then cut over.` },
    { domain: 'migrate', front: `What does DMS not convert in heterogeneous migrations?`, back: `Schema code such as <b>stored procedures, triggers, functions</b> – use SCT or DMS Schema Conversion.` },
    { domain: 'migrate', front: `DMS task type for minimal downtime`, back: `<b>Full load + CDC</b> (ongoing replication) until cutover.` },
    { domain: 'migrate', front: `1 Gbps in TB per day`, back: `About <b>10.8 TB/day</b> at full utilization (125 MB/s).` },
    { domain: 'migrate', front: `How long does 100 TB take over 1 Gbps?`, back: `About <b>9–10 days</b> at full utilization; longer on a shared link.` },
    { domain: 'migrate', front: `Managed SFTP/FTPS/AS2 endpoint into S3 or EFS`, back: `<b>AWS Transfer Family</b>.` },
    { domain: 'migrate', front: `DataSync vs Storage Gateway`, back: `<b>DataSync</b>: move or sync data (one-time or scheduled). <b>Storage Gateway</b>: ongoing hybrid access to cloud storage from on-premises.` },
    { domain: 'migrate', front: `Migrate ActiveMQ apps without rewriting clients`, back: `<b>Amazon MQ</b> (supports ActiveMQ and RabbitMQ protocols).` },
    { domain: 'migrate', front: `Babelfish for Aurora PostgreSQL`, back: `Lets Aurora PostgreSQL understand <b>T-SQL and the SQL Server wire protocol</b>, reducing app changes when leaving SQL Server.` },
    { domain: 'migrate', front: `Strangler fig pattern`, back: `Put a routing façade in front of a monolith and <b>incrementally replace</b> capabilities with new services until the monolith can be retired.` }
  ],
  // =======================================================================
  // PRACTICE QUESTIONS
  // =======================================================================
  questions: [
    // ---------------- org ----------------
    {
      id: 'sap-001', domain: 'org', lesson: 'p-access-control-at-scale', multi: false,
      question: `A healthcare company has 300 member accounts in AWS Organizations. Developers in workload accounts are allowed to manage their own S3 bucket policies. The security team must guarantee that objects in any S3 bucket in the organization can never be accessed by IAM principals that belong to AWS accounts outside the organization, even if a developer writes an overly permissive bucket policy. The control must be preventive and must require the least ongoing operational effort. Which solution meets these requirements?`,
      options: [
        `Attach an SCP to the root that denies all S3 actions when aws:PrincipalOrgID does not equal the organization ID.`,
        `Deploy an AWS Config managed rule that detects bucket policies granting cross-account access and an SSM Automation document that removes the offending statements.`,
        `Attach a resource control policy (RCP) to the root that denies S3 actions when aws:PrincipalOrgID does not equal the organization ID, with an exception for AWS service principals.`,
        `Enable IAM Access Analyzer with the organization as the zone of trust and send findings for external access to the security team through Amazon EventBridge.`
      ],
      answer: [2],
      explanation: `<b>C is correct.</b> RCPs set the maximum permissions on resources in member accounts regardless of who calls, so a deny on <code>aws:PrincipalOrgID</code> blocks external principals even when a bucket policy allows them. It is preventive and centrally managed.<br><b>A</b> is wrong: SCPs only constrain principals <em>inside</em> member accounts; an external principal is not subject to your SCPs, so the SCP cannot stop it.<br><b>B</b> is detective and reactive: there is a window of exposure between the change and the remediation, and it adds operational components.<br><b>D</b> only reports findings; it does not prevent access.`
    },
    {
      id: 'sap-002', domain: 'org', lesson: 'p-multi-account-strategy', multi: true,
      question: `A company uses AWS Organizations with 150 accounts and creates roughly 10 new accounts each month. The security team works from a dedicated Security Tooling member account and is not permitted to sign in to the management account. The team needs Amazon GuardDuty and AWS Security Hub enabled in every existing and future account, with all findings visible from the Security Tooling account, and with the least operational overhead. Which combination of steps should a solutions architect take? (Choose TWO.)`,
      options: [
        `From the management account, register the Security Tooling account as the delegated administrator for GuardDuty and for Security Hub.`,
        `From the Security Tooling account, enable auto-enable for new organization member accounts in GuardDuty and use Security Hub central configuration to apply a configuration policy to the organization root.`,
        `Create a CloudFormation StackSet with self-managed permissions in the management account that enables GuardDuty and Security Hub in each account, and rerun it monthly.`,
        `Create an IAM user in each member account for the security team and enable the services manually during account onboarding.`,
        `Attach an SCP to the root OU that enables GuardDuty and Security Hub in every account.`
      ],
      answer: [0, 1],
      explanation: `<b>A and B are correct.</b> Registering a delegated administrator lets the Security Tooling account manage both services for the whole organization without using the management account. Auto-enable (GuardDuty) and central configuration (Security Hub) cover existing and newly created accounts automatically.<br><b>C</b> works partially but self-managed StackSets require roles in every account, do not auto-deploy to new accounts, and need a recurring manual run – far more overhead – and it would run from the management account.<br><b>D</b> is manual, does not scale and creates long-term IAM user credentials.<br><b>E</b> is impossible: SCPs only restrict permissions; they cannot enable services or create resources.`
    },
    {
      id: 'sap-003', domain: 'org', lesson: 'p-hybrid-connectivity', multi: false,
      question: `A financial services company is designing AWS Direct Connect connectivity from two data centers to AWS. Production traffic between on premises and AWS averages 15 Gbps, with peaks of 18 Gbps. Business requirements state that the failure of any single Direct Connect location or any single device must not reduce available bandwidth below 20 Gbps. Which design meets these requirements?`,
      options: [
        `Order a link aggregation group (LAG) of four 10 Gbps dedicated connections at one Direct Connect location, terminating on the same AWS device.`,
        `Order two 10 Gbps dedicated connections on separate devices at one Direct Connect location, and add an AWS Site-to-Site VPN connection as a backup.`,
        `Order one 10 Gbps dedicated connection at each of two Direct Connect locations and configure BGP for active/active load sharing.`,
        `Order two 10 Gbps dedicated connections on separate devices at each of two Direct Connect locations, connected to separate customer routers.`
      ],
      answer: [3],
      explanation: `<b>D is correct.</b> This is the AWS Maximum Resiliency model: four connections across two locations. Losing a whole location still leaves 2 x 10 Gbps = 20 Gbps.<br><b>A</b> is a single location and a single device; a location or device failure removes all connectivity.<br><b>B</b> survives a device failure but not a location failure, and a VPN backup offers roughly 1.25 Gbps per tunnel over the internet – far below 20 Gbps.<br><b>C</b> (High Resiliency) survives a location failure but leaves only 10 Gbps, violating the 20 Gbps requirement.`
    },
    {
      id: 'sap-004', domain: 'org', lesson: 'p-hybrid-connectivity', multi: false,
      question: `A company runs 60 VPCs attached to a single AWS Transit Gateway. Twenty VPCs are production, thirty are development, and ten host shared services such as Active Directory and artifact repositories. A Direct Connect gateway connects the Transit Gateway to the corporate data center. Production and development VPCs must not be able to communicate with each other, but both must reach the shared services VPCs and the data center. New VPCs are added weekly and the solution must be easy to maintain. What should a solutions architect do?`,
      options: [
        `Create three Transit Gateway route tables (Prod, Dev, Shared). Associate production attachments with Prod and development attachments with Dev. Propagate shared services and Direct Connect gateway attachments into Prod and Dev, and propagate production and development attachments into Shared, which is associated with the shared services and Direct Connect gateway attachments.`,
        `Keep the default Transit Gateway route table with all attachments propagating, and add blackhole routes for each development CIDR in production VPC route tables and each production CIDR in development VPC route tables.`,
        `Replace the Transit Gateway with VPC peering between each production VPC and each shared services VPC, and between each development VPC and each shared services VPC.`,
        `Keep the default Transit Gateway route table and use security groups in each production instance that deny inbound traffic from development CIDR ranges.`
      ],
      answer: [0],
      explanation: `<b>A is correct.</b> Separate route tables create routing domains: Prod and Dev tables contain only shared and on-premises routes, so the environments cannot reach each other, while the Shared table knows all spokes for return traffic. New VPCs simply associate and propagate to the right tables.<br><b>B</b> requires maintaining per-CIDR blackhole/VPC routes for every new VPC – error-prone; also blackhole routes are a TGW route table feature, not a VPC route table feature.<br><b>C</b> creates hundreds of peering connections, cannot provide transitive access to the data center, and is hard to maintain.<br><b>D</b> is impossible as described: security groups support only allow rules, not deny rules, and it leaves the network path open.`
    },
    {
      id: 'sap-005', domain: 'org', lesson: 'p-dns-privatelink-inspection', multi: false,
      question: `A company has a Route 53 private hosted zone named aws.example.internal that is associated with a shared services VPC. The VPC connects to the on-premises network over AWS Direct Connect through a Transit Gateway. On-premises applications use on-premises DNS servers and must resolve records in aws.example.internal. The solution must be highly available and require no changes to on-premises clients. What should the solutions architect do?`,
      options: [
        `Create a Route 53 Resolver outbound endpoint in the shared services VPC and a forwarding rule for aws.example.internal that targets the on-premises DNS servers.`,
        `Create a Route 53 Resolver inbound endpoint with IP addresses in two Availability Zones in the shared services VPC, and configure conditional forwarders on the on-premises DNS servers for aws.example.internal that point to the inbound endpoint IP addresses.`,
        `Configure conditional forwarders on the on-premises DNS servers that send queries for aws.example.internal to the VPC base CIDR plus two address of the shared services VPC over Direct Connect.`,
        `Create a public hosted zone named aws.example.internal containing the same records and configure the on-premises DNS servers to forward queries to the internet.`
      ],
      answer: [1],
      explanation: `<b>B is correct.</b> Inbound endpoints give the VPC Resolver reachable ENI IP addresses; on-premises DNS servers conditionally forward to them, and using two AZs provides high availability. Clients are unchanged because their existing DNS servers do the forwarding.<br><b>A</b> solves the opposite direction (AWS resolving on-premises names).<br><b>C</b> fails because the VPC +2 Resolver address is not reachable from outside the VPC.<br><b>D</b> exposes internal records publicly and the private IPs would still be resolved through the internet – a security and design anti-pattern.`
    },
    {
      id: 'sap-006', domain: 'org', lesson: 'p-dns-privatelink-inspection', multi: true,
      question: `A company has 200 VPCs spread across 40 accounts in AWS Organizations. All VPCs are attached to a Transit Gateway owned by a central network account, which also connects to on-premises data centers. Workloads in every VPC must resolve hostnames in the on-premises domain corp.example.com. The network team wants to minimize cost and operational overhead and keep DNS management centralized. AWS-provided DNS for private hosted zones must continue to work in every VPC. Which combination of steps should the solutions architect take? (Choose TWO.)`,
      options: [
        `Create a Route 53 Resolver outbound endpoint in every spoke VPC and a local forwarding rule in each account.`,
        `Create a DHCP options set in every VPC that points domain-name-servers to the on-premises DNS servers.`,
        `Create a Route 53 Resolver outbound endpoint in a VPC in the central network account, in at least two Availability Zones, with routing to the on-premises DNS servers through the Transit Gateway.`,
        `Create Route 53 Resolver inbound endpoints in every spoke VPC so that on-premises DNS servers can answer the queries.`,
        `Create a forwarding rule for corp.example.com that uses the central outbound endpoint, share it with the organization by using AWS RAM, and associate it with each spoke VPC.`
      ],
      answer: [2, 4],
      explanation: `<b>C and E are correct.</b> A single, centralized, multi-AZ outbound endpoint plus a forwarding rule shared through RAM lets every spoke VPC forward corp.example.com queries without its own endpoints; spoke VPCs continue to use the Resolver for everything else.<br><b>A</b> works but multiplies endpoint cost (charged per ENI-hour) and management across 200 VPCs.<br><b>B</b> sends all DNS, including AWS private hosted zone and AWS service names, to on-premises servers, breaking private hosted zone resolution and adding dependency on the data center.<br><b>D</b> addresses the wrong direction – inbound endpoints serve queries coming from on premises.`
    },
    {
      id: 'sap-007', domain: 'org', lesson: 'p-dns-privatelink-inspection', multi: false,
      question: `A SaaS provider runs a TCP-based API on Amazon EC2 instances in its own VPC. Hundreds of enterprise customers want to consume the API from their own VPCs. Many customer VPCs use the same 10.0.0.0/16 CIDR as the provider. Customers require that traffic never traverse the public internet and that the provider cannot initiate connections into customer networks. What should the provider implement?`,
      options: [
        `Share a Transit Gateway with each customer by using AWS RAM and have customers attach their VPCs.`,
        `Create a VPC peering connection with each customer VPC and update route tables on both sides.`,
        `Place the API behind a public Application Load Balancer protected by AWS WAF with an IP allow list for each customer's NAT gateway addresses.`,
        `Place the API behind a Network Load Balancer, create a VPC endpoint service (AWS PrivateLink), and have customers create interface VPC endpoints in their VPCs.`
      ],
      answer: [3],
      explanation: `<b>D is correct.</b> PrivateLink presents the service as ENIs inside each consumer VPC, works with overlapping CIDRs, keeps traffic on the AWS network, and is unidirectional (consumer to provider).<br><b>A</b> and <b>B</b> require non-overlapping CIDRs and create bidirectional network connectivity, letting the provider reach customer networks.<br><b>C</b> sends traffic over the public internet, which violates the requirement.`
    },
    {
      id: 'sap-008', domain: 'org', lesson: 'p-dns-privatelink-inspection', multi: false,
      question: `A company implemented centralized inspection: spoke VPCs route all traffic through a Transit Gateway to an inspection VPC that contains AWS Network Firewall endpoints in three Availability Zones. East-west traffic between spoke VPCs in different Availability Zones intermittently fails, and Network Firewall logs show return packets arriving at a firewall endpoint that never saw the initial SYN. What is the MOST likely fix?`,
      options: [
        `Increase the capacity of the Network Firewall stateful rule groups.`,
        `Enable appliance mode on the Transit Gateway attachment for the inspection VPC.`,
        `Create a separate Transit Gateway route table for each Availability Zone.`,
        `Change the firewall policy to use stateless rules only with the forward action.`
      ],
      answer: [1],
      explanation: `<b>B is correct.</b> Without appliance mode, the Transit Gateway keeps traffic in the AZ of the source attachment, so request and response can traverse firewall endpoints in different AZs. Appliance mode pins a flow to one AZ for its lifetime, giving the stateful firewall symmetric traffic.<br><b>A</b> does not address asymmetry; capacity is not the issue.<br><b>C</b> does not control AZ selection for a flow and adds complexity.<br><b>D</b> would mask the symptom by dropping stateful inspection entirely, defeating the purpose of the firewall.`
    },
    {
      id: 'sap-009', domain: 'org', lesson: 'p-multi-account-strategy', multi: false,
      question: `A startup created its AWS Organizations organization from the account that already ran its production workloads. The security team attached an SCP to the organization root that denies all actions outside eu-west-1 and eu-central-1. An audit finds that engineers are still launching EC2 instances in us-east-1 in the production account. Member accounts are correctly restricted. What should the solutions architect recommend?`,
      options: [
        `Migrate the production workloads out of the management account into a new member account in a Workloads OU, and keep the management account limited to billing and organization administration.`,
        `Attach the SCP directly to the production account in addition to the root.`,
        `Add an explicit deny statement for ec2:RunInstances with an aws:RequestedRegion condition to the SCP.`,
        `Enable AWS Control Tower Region deny control, which applies to all accounts including the management account.`
      ],
      answer: [0],
      explanation: `<b>A is correct.</b> The production account is the management account, and SCPs never apply to the management account. The durable fix is to move workloads into a member account where guardrails apply.<br><b>B</b> and <b>C</b> still rely on SCPs, which have no effect on the management account no matter how they are attached or written.<br><b>D</b> is wrong because the Control Tower Region deny control is implemented with SCPs and therefore also does not restrict the management account.`
    },
    {
      id: 'sap-010', domain: 'org', lesson: 'p-access-control-at-scale', multi: true,
      question: `A global bank is implementing a data perimeter across 500 AWS accounts. Requirements: (1) employees must not be able to upload data to S3 buckets owned by other organizations; (2) S3 buckets and KMS keys in the organization must only be usable by principals in the organization; (3) access to sensitive buckets must originate only from the corporate network or the company's VPC endpoints. AWS services that act on the bank's behalf, such as CloudTrail log delivery, must not be broken. Which combination of controls meets these requirements? (Choose THREE.)`,
      options: [
        `Enable Amazon Macie in all accounts to classify sensitive data.`,
        `An SCP that denies S3 actions when aws:ResourceOrgID does not equal the organization ID.`,
        `S3 Block Public Access enabled at the organization level for all accounts.`,
        `An RCP that denies S3 and KMS actions when aws:PrincipalOrgID does not equal the organization ID, unless aws:PrincipalIsAWSService is true.`,
        `IAM permissions boundaries on every role that allow S3 actions only when aws:PrincipalOrgID equals the organization ID.`,
        `An RCP applied to the OUs holding sensitive buckets that denies S3 actions unless the request comes from approved aws:SourceVpce values or corporate aws:SourceIp ranges, with exceptions for AWS service principals.`
      ],
      answer: [1, 3, 5],
      explanation: `<b>B, D and F are correct.</b> The SCP with <code>aws:ResourceOrgID</code> covers "trusted resources" for your identities; the RCP with <code>aws:PrincipalOrgID</code> covers "trusted identities" for your resources; and the network-condition RCP covers "expected networks". Service-principal exceptions keep AWS services working.<br><b>A</b> discovers sensitive data but enforces nothing.<br><b>C</b> blocks public access but does not stop access by authenticated principals from other accounts or exfiltration to external buckets.<br><b>E</b> is ineffective: <code>aws:PrincipalOrgID</code> on your own principals is always true, and boundaries do not restrict which buckets are targeted or external principals.`
    },
    {
      id: 'sap-011', domain: 'org', lesson: 'p-access-control-at-scale', multi: false,
      question: `An analytics account must read objects from a bucket in a data-producer account. The bucket policy grants s3:GetObject to an IAM role in the analytics account, and the role's identity policy allows s3:GetObject on the bucket. Objects are encrypted with SSE-KMS using the AWS managed key aws/s3. Requests from the analytics role fail with AccessDenied. What should the solutions architect do?`,
      options: [
        `Add kms:Decrypt for the aws/s3 key ARN to the analytics role identity policy.`,
        `Edit the aws/s3 key policy to allow kms:Decrypt for the analytics account.`,
        `Create a customer managed KMS key in the producer account whose key policy allows the analytics role to decrypt, re-encrypt existing objects with it, and set it as the bucket default encryption key.`,
        `Enable S3 Bucket Keys on the bucket to reduce the number of KMS calls.`
      ],
      answer: [2],
      explanation: `<b>C is correct.</b> AWS managed keys have key policies that you cannot modify, so they cannot be used cross-account. A customer managed key with a key policy granting the external role, plus an identity policy allow, enables cross-account decrypt.<br><b>A</b> is insufficient: KMS also requires the key policy to allow the external account, which aws/s3 never will.<br><b>B</b> is not possible because AWS managed key policies are not editable.<br><b>D</b> reduces KMS request costs but does not change authorization.`
    },
    {
      id: 'sap-012', domain: 'org', lesson: 'p-access-control-at-scale', multi: false,
      question: `A company with 80 AWS accounts uses Okta as its workforce identity provider. Engineers currently use IAM users in each account. The company wants single sign-on to all accounts, automatic creation and removal of users and group memberships when changes are made in Okta, and access decisions based on an Okta "costCenter" attribute without creating a permission set per cost center. What should the solutions architect do?`,
      options: [
        `Create an IAM SAML identity provider in each account that trusts Okta, and create roles per cost center in each account.`,
        `Deploy AWS Managed Microsoft AD, synchronize users from Okta with a custom script, and connect IAM Identity Center to the directory.`,
        `Use Amazon Cognito user pools federated with Okta and issue temporary credentials through identity pools for console access.`,
        `Enable IAM Identity Center, configure Okta as the external identity provider with SAML 2.0 and SCIM automatic provisioning, and use attributes for access control mapping costCenter to session tags used in ABAC policies.`
      ],
      answer: [3],
      explanation: `<b>D is correct.</b> Identity Center with Okta uses SAML for sign-in and SCIM for automatic provisioning and deprovisioning; attributes for access control pass costCenter as a session tag so a single permission set can use ABAC conditions.<br><b>A</b> requires per-account IdP and role management with no automatic provisioning – high overhead across 80 accounts.<br><b>B</b> introduces a directory and custom sync code that is unnecessary and fragile.<br><b>C</b> Cognito is for customer (application) identities, not workforce access to the AWS console across accounts.`
    },
    {
      id: 'sap-013', domain: 'org', lesson: 'p-hybrid-connectivity', multi: true,
      question: `A company has two 10 Gbps dedicated Direct Connect connections that use transit VIFs to a Direct Connect gateway associated with a Transit Gateway. A new regulation requires all traffic between the data center and AWS to be encrypted in transit. The security team prohibits assigning public IP addresses or creating public VIFs for this traffic, and aggregate encrypted throughput must exceed 5 Gbps. Which solutions meet these requirements? (Choose TWO.)`,
      options: [
        `Create AWS Site-to-Site VPN connections to a virtual private gateway over a public VIF.`,
        `Enable MACsec on the dedicated connections, using routers and Direct Connect locations that support MACsec.`,
        `Create Private IP Site-to-Site VPN connections to the Transit Gateway over the transit VIFs, and use ECMP across multiple tunnels.`,
        `Enable the encryption option on the existing transit VIFs.`,
        `Create accelerated Site-to-Site VPN connections to the Transit Gateway through AWS Global Accelerator.`
      ],
      answer: [1, 2],
      explanation: `<b>B and C are correct.</b> MACsec provides Layer 2 line-rate encryption on supported dedicated connections. Private IP VPN runs IPsec over a transit VIF using private addresses, and ECMP across multiple tunnels on a Transit Gateway scales beyond a single tunnel's ~1.25 Gbps.<br><b>A</b> needs a public VIF and public endpoints, and a VGW does not support ECMP, capping throughput.<br><b>D</b> does not exist – VIFs have no encryption toggle.<br><b>E</b> accelerated VPN travels over the internet to public endpoints, violating the no-public-IP rule.`
    },
    // ---------------- new ----------------
    {
      id: 'sap-014', domain: 'new', lesson: 'p-multi-region-active-active', multi: false,
      question: `A company runs an order management system on Amazon Aurora MySQL in us-east-1. The business requires that, in the event of a Regional outage, the database can be recovered in us-west-2 with an RPO of about one second and an RTO of a few minutes. Reporting users in us-west-2 also need low-latency read access during normal operations. Replication must not consume significant CPU on the primary database. Which solution meets these requirements?`,
      options: [
        `Create an Aurora MySQL cross-Region read replica cluster using binary log replication in us-west-2 and promote it during a disaster.`,
        `Enable Aurora automated backups with cross-Region snapshot copy every 15 minutes to us-west-2 and restore the latest snapshot during a disaster.`,
        `Convert the cluster to an Aurora Global Database with a secondary cluster in us-west-2, direct reporting users to the secondary reader endpoint, and use a managed failover during a disaster.`,
        `Use AWS DMS with ongoing replication from the Aurora cluster to a separate Aurora cluster in us-west-2 and switch the application connection string during a disaster.`
      ],
      answer: [2],
      explanation: `<b>C is correct.</b> Aurora Global Database replicates at the storage layer with typical lag under one second without loading the primary's engine, provides readable secondaries, and supports managed failover with RTO in minutes.<br><b>A</b> binlog replication uses primary engine resources, typically shows higher lag under load, and promotion is slower.<br><b>B</b> gives an RPO of up to 15 minutes and an RTO of a restore – far outside the requirement.<br><b>D</b> DMS adds operational overhead, is logical replication with higher lag, and is not a DR mechanism designed for this RPO/RTO.`
    },
    {
      id: 'sap-015', domain: 'new', lesson: 'p-multi-region-active-active', multi: false,
      question: `A gaming company serves players from us-east-1 and ap-southeast-1. Each player's profile and inventory are updated frequently, and players occasionally travel and connect to the other Region. The game must allow writes in both Regions with single-digit-millisecond latency, continue operating if either Region becomes unavailable, and require minimal custom replication code. Occasional last-writer-wins conflicts are acceptable. Which data store design should the solutions architect choose?`,
      options: [
        `Amazon DynamoDB global tables with replicas in both Regions, with the application writing to the replica in the local Region.`,
        `Amazon Aurora Global Database with the primary in us-east-1 and write forwarding enabled in ap-southeast-1.`,
        `Amazon RDS for PostgreSQL in each Region with logical replication configured in both directions.`,
        `Amazon ElastiCache for Redis OSS Global Datastore with the primary cluster in us-east-1.`
      ],
      answer: [0],
      explanation: `<b>A is correct.</b> DynamoDB global tables are multi-active: each Region accepts local low-latency writes, replication is managed, and last-writer-wins conflict resolution matches the stated tolerance.<br><b>B</b> forwards writes to a single primary Region, adding cross-Region latency to every write from ap-southeast-1, and writes depend on the primary Region.<br><b>C</b> bidirectional logical replication is custom, complex, and prone to conflicts without built-in resolution.<br><b>D</b> Global Datastore has a single primary for writes; secondaries are read-only, and it is a cache, not a durable system of record.`
    },
    {
      id: 'sap-016', domain: 'new', lesson: 'p-multi-region-active-active', multi: true,
      question: `A payment company runs an active/passive workload in us-east-1 and us-west-2 with Route 53 failover records. During a past partial outage, automated health checks flapped and caused unnecessary failovers, and the operations team could not reach some control plane APIs in the impaired Region to fix DNS. The company wants failover to be an explicit operator decision that remains possible during a Regional impairment, and to prevent operators from accidentally disabling both Regions at the same time. Which combination of actions should the solutions architect recommend? (Choose TWO.)`,
      options: [
        `Deploy an AWS Lambda function in us-east-1 that updates the Route 53 records when a CloudWatch alarm fires.`,
        `Document a runbook that uses the Route 53 ChangeResourceRecordSets API to update the failover records during an event.`,
        `Create an Amazon Route 53 Application Recovery Controller cluster with a routing control per Region, attach routing control health checks to the failover records, and change routing control states through the cluster data plane endpoints.`,
        `Configure a Route 53 ARC safety rule (assertion rule) that requires at least one routing control to remain On.`,
        `Replace the failover records with latency-based records and evaluate target health.`
      ],
      answer: [2, 3],
      explanation: `<b>C and D are correct.</b> ARC routing controls are operator-driven switches stored in a highly available cluster spanning multiple Regions, and they are changed through data-plane endpoints, avoiding dependence on the impaired Region or on Route 53 control-plane changes. Safety rules prevent unsafe states such as both Regions being Off.<br><b>A</b> automates failover from inside the Region that may fail, and keeps the automated (flapping-prone) behavior.<br><b>B</b> depends on the Route 53 control plane (ChangeResourceRecordSets), which is precisely what AWS recommends not relying on during recovery.<br><b>E</b> remains automated and health-check driven, and makes the design active/active by latency rather than an explicit operator decision.`
    },
    {
      id: 'sap-017', domain: 'new', lesson: 'p-event-driven-serverless', multi: false,
      question: `A brokerage processes trade instructions submitted through Amazon API Gateway. Instructions for the same customer account must be processed strictly in the order received and exactly once, but instructions for different accounts can be processed in parallel. Volume is expected to grow to several thousand messages per second at market open. Which design meets these requirements?`,
      options: [
        `Send messages to an SQS standard queue that includes a sequence number in each message, and have consumers reorder messages in memory before processing.`,
        `Publish messages to an SNS standard topic that fans out to one SQS standard queue per consumer.`,
        `Send messages to an SQS FIFO queue using a single, constant message group ID so that all messages are processed in order.`,
        `Send messages to an SQS FIFO queue with high-throughput mode enabled, using the customer account ID as the message group ID and a deduplication ID per instruction.`
      ],
      answer: [3],
      explanation: `<b>D is correct.</b> FIFO queues guarantee ordering within a message group and deduplicate within the deduplication interval; using the account ID as the group ID allows parallel processing across accounts, and high-throughput mode supports the higher rate.<br><b>A</b> standard queues deliver at least once and out of order; in-memory reordering across distributed consumers is unreliable and does not stop duplicates.<br><b>B</b> SNS standard and SQS standard provide no ordering or exactly-once guarantees.<br><b>C</b> a single message group serializes everything to one consumer at a time, so it cannot scale to thousands of messages per second.`
    },
    {
      id: 'sap-018', domain: 'new', lesson: 'p-event-driven-serverless', multi: false,
      question: `A telemetry platform ingests clickstream events into Amazon Kinesis Data Streams. Five independent applications (fraud detection, personalization, archiving, billing, and a real-time dashboard) each need to read the full stream with consistently low latency. Since the fourth and fifth consumers were added, all consumers report increased latency and ReadProvisionedThroughputExceeded errors, although the producers are well within ingest limits. What should the solutions architect do?`,
      options: [
        `Double the number of shards so each consumer receives more read throughput.`,
        `Register each consumer for enhanced fan-out and have it use SubscribeToShard.`,
        `Replace the stream with an SQS standard queue per application, with the producer writing to all five queues.`,
        `Increase the data retention period of the stream to 7 days so that consumers can catch up.`
      ],
      answer: [1],
      explanation: `<b>B is correct.</b> Standard consumers share 2 MB/s of read throughput per shard (and a per-shard GetRecords call limit); enhanced fan-out gives each registered consumer a dedicated 2 MB/s per shard with push-based, low-latency delivery.<br><b>A</b> adds cost and complexity by resharding when ingest is not the bottleneck, and consumers still contend for shared reads.<br><b>C</b> pushes fan-out complexity into the producer and loses replay and ordering by key.<br><b>D</b> lets consumers fall further behind without fixing throughput contention.`
    },
    {
      id: 'sap-019', domain: 'new', lesson: 'p-event-driven-serverless', multi: false,
      question: `An insurance company is automating claim processing. Each claim passes through document validation, fraud scoring, and payment. Claims above a threshold require manual approval by an adjuster, which can take up to five days. The company needs a visual audit trail of every step, exactly-once execution of payment steps, and the least custom code. Which solution should the solutions architect recommend?`,
      options: [
        `An AWS Step Functions Standard workflow that uses the .waitForTaskToken integration pattern to pause for adjuster approval, with Retry and Catch for each step.`,
        `An AWS Step Functions Express workflow that polls a DynamoDB table every minute for adjuster approval.`,
        `A chain of Lambda functions connected by SQS queues, with a DynamoDB table storing approval status checked by a scheduled Lambda function.`,
        `Amazon EventBridge rules that route events between Lambda functions, with adjusters approving claims by publishing custom events.`
      ],
      answer: [0],
      explanation: `<b>A is correct.</b> Standard workflows run up to one year, provide exactly-once execution and full visual execution history, and the task token pattern pauses until a callback (the adjuster decision) is received – no polling.<br><b>B</b> Express workflows are limited to five minutes and are at-least-once, so they cannot wait five days.<br><b>C</b> requires significant custom orchestration code and offers no built-in audit trail.<br><b>D</b> EventBridge routes events but does not manage workflow state, ordering or exactly-once semantics.`
    },
    {
      id: 'sap-020', domain: 'new', lesson: 'p-event-driven-serverless', multi: true,
      question: `An e-commerce company uses an AWS Lambda function with an SQS event source mapping to write orders into an Amazon RDS for MySQL database. During flash sales, Lambda scales out rapidly and the database runs out of connections, causing failures. Additionally, a single malformed message causes the entire batch of 10 messages to be retried repeatedly. Which combination of changes will resolve these issues? (Choose TWO.)`,
      options: [
        `Increase the memory allocated to the Lambda function so that each invocation finishes faster.`,
        `Replace the SQS queue with an SNS topic that invokes the Lambda function directly.`,
        `Reduce the SQS visibility timeout to 1 second so that failed messages are retried sooner.`,
        `Configure maximum concurrency on the SQS event source mapping to a value the database can sustain.`,
        `Enable ReportBatchItemFailures on the event source mapping, return only the failed message IDs, and configure a dead-letter queue with an appropriate maxReceiveCount.`
      ],
      answer: [3, 4],
      explanation: `<b>D and E are correct.</b> Maximum concurrency caps how many concurrent invocations the SQS poller drives, protecting the database while messages buffer safely in the queue. Partial batch responses retry only failed messages, and the DLQ removes poison messages after a set number of receives.<br><b>A</b> may shorten execution but does not cap concurrency or fix batch retries.<br><b>B</b> removes the buffer entirely; push invocations would hit the database even harder.<br><b>C</b> makes messages reappear while still being processed, causing duplicate processing; AWS recommends a visibility timeout of at least six times the function timeout.`
    },
    {
      id: 'sap-021', domain: 'new', lesson: 'p-containers-caching', multi: false,
      question: `A company runs a large Amazon EKS cluster using the Amazon VPC CNI plugin in a VPC with a 10.20.0.0/20 CIDR. The corporate network team cannot allocate more routable RFC 1918 address space. As the number of pods grows, new pods fail to start because subnets have no available IP addresses. The pods only need to be reachable from within the cluster and through an internal load balancer. What should the solutions architect do?`,
      options: [
        `Replace the VPC CNI with host networking mode for all pods.`,
        `Move all workloads to EKS on Fargate, which does not consume VPC IP addresses.`,
        `Associate a secondary CIDR from the 100.64.0.0/10 range with the VPC, create subnets from it, and configure VPC CNI custom networking so that pods receive IP addresses from the new subnets.`,
        `Create a second VPC with a larger CIDR and peer it with the existing VPC, then schedule new pods into nodes in the second VPC.`
      ],
      answer: [2],
      explanation: `<b>C is correct.</b> Adding a non-routable secondary CIDR (CG-NAT range) and using custom networking (ENIConfig) places pod IPs in new subnets without consuming scarce corporate space; nodes stay in the routable subnets for external access.<br><b>A</b> host networking causes port conflicts and weakens isolation; it is not a scalable fix.<br><b>B</b> is wrong because each Fargate pod still consumes a VPC IP address.<br><b>D</b> a single EKS cluster cannot simply span peered VPCs for scheduling, and the new VPC would also need corporate address space.`
    },
    {
      id: 'sap-022', domain: 'new', lesson: 'p-containers-caching', multi: false,
      question: `A media company is containerizing 15 stateless microservices that currently run on EC2 instances. The development team has no Kubernetes experience, does not need portability to other platforms, and wants the least operational overhead, including no server patching. Several services must call each other by name, and each service needs its own IAM permissions. Which solution should the solutions architect recommend?`,
      options: [
        `Amazon EKS with managed node groups, Kubernetes service discovery, and IAM roles for service accounts.`,
        `Amazon ECS on AWS Fargate with ECS Service Connect for service-to-service communication and a separate task IAM role for each service.`,
        `Docker installed on an Auto Scaling group of EC2 instances, with Route 53 private hosted zone records for each service.`,
        `Amazon EKS on EC2 with Karpenter for node provisioning and EKS Pod Identity for per-service permissions.`
      ],
      answer: [1],
      explanation: `<b>B is correct.</b> ECS is AWS-native and simpler to operate, Fargate removes node management and patching, Service Connect provides name-based service discovery, and task roles give per-service IAM permissions.<br><b>A</b> and <b>D</b> require Kubernetes skills the team lacks and (with EC2 nodes) node patching; they fit organizations already invested in Kubernetes.<br><b>C</b> requires managing hosts, patching and custom orchestration – the most overhead.`
    },
    {
      id: 'sap-023', domain: 'new', lesson: 'p-containers-caching', multi: false,
      question: `A retail application stores its product catalog in Amazon DynamoDB. During promotions, read traffic on popular items spikes to millions of requests per second, causing throttling and p99 latency of tens of milliseconds. The application uses eventually consistent reads and the team wants microsecond read latency with minimal code changes. Which solution meets these requirements?`,
      options: [
        `Switch the table to on-demand capacity mode.`,
        `Add Amazon ElastiCache (Valkey) in front of DynamoDB and implement cache-aside logic in the application.`,
        `Create DynamoDB global tables in additional Regions and spread read traffic across them.`,
        `Deploy a DynamoDB Accelerator (DAX) cluster and point the application's DynamoDB client at the DAX endpoint.`
      ],
      answer: [3],
      explanation: `<b>D is correct.</b> DAX is an API-compatible, in-memory cache for DynamoDB that delivers microsecond reads for eventually consistent requests and absorbs hot-key reads with minimal code change (swap the client).<br><b>A</b> helps with capacity planning but not with hot partitions or microsecond latency.<br><b>B</b> works but requires writing and maintaining cache logic – more code than DAX.<br><b>C</b> adds cross-Region complexity and does not deliver microsecond latency.`
    },
    {
      id: 'sap-024', domain: 'new', lesson: 'p-security-architecture', multi: false,
      question: `A bank must encrypt data in Amazon S3, Amazon EBS, and Amazon RDS using native service integration. A regulator requires that the key material be stored in single-tenant, FIPS-validated hardware security modules that the bank exclusively controls, and that the bank can audit every key use in AWS CloudTrail. Which solution meets these requirements with the least operational overhead?`,
      options: [
        `Create an AWS KMS custom key store backed by an AWS CloudHSM cluster with HSMs in at least two Availability Zones, create KMS keys in the custom key store, and use them for SSE-KMS, EBS and RDS encryption.`,
        `Create AWS KMS customer managed keys with imported key material generated on the bank's on-premises HSM.`,
        `Use AWS CloudHSM directly and modify each application to perform client-side encryption with the PKCS#11 library before writing to S3, EBS and RDS.`,
        `Use AWS KMS customer managed keys with automatic rotation enabled and restrict the key policy to the bank's security administrators.`
      ],
      answer: [0],
      explanation: `<b>A is correct.</b> A custom key store keeps key material in the bank's dedicated CloudHSM cluster while AWS services keep using the standard KMS integration, and KMS logs every use to CloudTrail.<br><b>B</b> imported material is still stored in the multi-tenant KMS HSM fleet, not single-tenant HSMs the bank controls.<br><b>C</b> meets custody but requires rewriting applications and cannot use native EBS or RDS encryption – high overhead.<br><b>D</b> uses AWS-operated multi-tenant HSMs, failing the single-tenant requirement.`
    },
    {
      id: 'sap-025', domain: 'new', lesson: 'p-security-architecture', multi: false,
      question: `A healthcare SaaS application stores records in a DynamoDB global table replicated across us-east-1 and eu-west-1. A compliance requirement mandates client-side encryption of specific attributes before writing. Applications in each Region must decrypt records written in the other Region with low latency and must continue to decrypt even if the other Region is unavailable. What should the solutions architect use for the encryption keys?`,
      options: [
        `A single KMS customer managed key in us-east-1 that both Regional applications call for encryption and decryption.`,
        `Separate, independent KMS keys in each Region, with each application re-encrypting records written in the other Region.`,
        `A KMS multi-Region primary key in us-east-1 with a replica key in eu-west-1, with each application using the key in its own Region through the AWS Database Encryption SDK.`,
        `An AWS CloudHSM cluster in us-east-1 with cluster backups copied to eu-west-1 nightly.`
      ],
      answer: [2],
      explanation: `<b>C is correct.</b> Multi-Region keys share key ID and key material, so ciphertext produced in one Region can be decrypted with the related key in the other Region locally, with no cross-Region dependency.<br><b>A</b> adds cross-Region latency and fails if us-east-1 is unavailable.<br><b>B</b> requires custom re-encryption and cannot decrypt the replicated ciphertext directly.<br><b>D</b> introduces heavy operational overhead and a nightly backup copy does not provide continuous availability or low-latency decryption in eu-west-1 without restoring a cluster.`
    },
    {
      id: 'sap-026', domain: 'new', lesson: 'p-security-architecture', multi: true,
      question: `A company with 250 accounts in AWS Organizations must retain AWS API activity logs for seven years. Auditors require that no one, including administrators in workload accounts and the root user of the logging account, can delete or modify logs during the retention period, and that logging cannot be disabled from workload accounts. Which combination of steps meets these requirements? (Choose THREE.)`,
      options: [
        `Create an organization trail in AWS CloudTrail that delivers logs for all accounts to an S3 bucket in a dedicated Log Archive account.`,
        `Enable S3 Object Lock in governance mode with a seven-year default retention on the log bucket.`,
        `Enable S3 Object Lock in compliance mode with a seven-year default retention on the log bucket.`,
        `Create a separate trail in each account, managed by the account owners, delivering to a local bucket.`,
        `Attach an SCP to the workload OUs that denies cloudtrail:StopLogging, cloudtrail:DeleteTrail, and cloudtrail:UpdateTrail.`,
        `Enable MFA delete on the log bucket and store the MFA device in a safe.`
      ],
      answer: [0, 2, 4],
      explanation: `<b>A, C and E are correct.</b> An organization trail centrally captures all accounts into a dedicated account; compliance-mode Object Lock prevents deletion or shortening of retention by anyone, including root; and the SCP stops workload accounts from tampering with trails.<br><b>B</b> governance mode can be bypassed by principals with <code>s3:BypassGovernanceRetention</code>.<br><b>D</b> decentralizes control to the very administrators who must not be able to alter logs.<br><b>F</b> MFA delete adds friction but the root user holding the device can still delete objects, so it does not meet the requirement.`
    },
    {
      id: 'sap-027', domain: 'new', lesson: 'p-security-architecture', multi: false,
      question: `A company operates in 12 AWS Regions across 90 accounts. The security team wants a single view of security findings from Amazon GuardDuty, Amazon Inspector, and AWS Config across all accounts and Regions, wants to enable the AWS Foundational Security Best Practices standard consistently in every account, and must not use the management account for daily operations. Which approach requires the least operational effort?`,
      options: [
        `Enable Security Hub in every account and Region individually and build an Amazon QuickSight dashboard over findings exported to S3 from each account.`,
        `Designate a security account as Security Hub delegated administrator, choose a home Region with cross-Region aggregation, and use central configuration policies to enable Security Hub and the standard in all accounts and Regions.`,
        `Enable AWS Config aggregators in the management account and review findings there.`,
        `Use Amazon Detective in each account to correlate findings and email summaries to the security team.`
      ],
      answer: [1],
      explanation: `<b>B is correct.</b> Delegated administration avoids the management account; cross-Region aggregation produces a single view; central configuration enables Security Hub and standards consistently in every account and Region, including new ones.<br><b>A</b> is manual and requires a custom pipeline.<br><b>C</b> covers Config compliance only, not GuardDuty or Inspector findings, and uses the management account.<br><b>D</b> Detective is an investigation tool, not a findings aggregator or standards engine.`
    },
    {
      id: 'sap-028', domain: 'new', lesson: 'p-containers-caching', multi: false,
      question: `A news website serves articles through Amazon CloudFront from an origin of EC2 instances behind an Application Load Balancer in us-east-1. Readers are worldwide. During breaking news, the origin is overloaded even though the cache hit ratio at individual edge locations is reasonable, because many edge locations request the same uncached objects simultaneously. Which change will MOST reduce load on the origin?`,
      options: [
        `Add more EC2 instances to the Auto Scaling group behind the ALB.`,
        `Reduce the cache TTL so that content is refreshed more often from the origin.`,
        `Enable AWS Global Accelerator in front of the ALB.`,
        `Enable CloudFront Origin Shield in the Region closest to the origin.`
      ],
      answer: [3],
      explanation: `<b>D is correct.</b> Origin Shield adds a centralized caching layer so requests from all edge locations and regional edge caches collapse into one place before the origin, greatly reducing duplicate origin fetches.<br><b>A</b> adds capacity but does not reduce origin requests and costs more.<br><b>B</b> increases origin requests.<br><b>C</b> improves network paths for dynamic traffic but does not cache, so origin load is unchanged.`
    },
    // ---------------- improve ----------------
    {
      id: 'sap-029', domain: 'improve', lesson: 'p-observability-performance', multi: false,
      question: `A SaaS company runs a microservices application spread across 35 AWS accounts in AWS Organizations. Each team can see only its own CloudWatch metrics, logs, and X-Ray traces. Incidents that cross service boundaries take hours to diagnose. The operations team wants a single place to search logs, view metrics dashboards, and follow traces across all accounts, with automatic onboarding of new accounts and without building log-copying pipelines. What should the solutions architect do?`,
      options: [
        `Configure CloudWatch cross-account observability with a central monitoring account, and link all source accounts through an Organizations-wide configuration that shares metrics, logs, and traces.`,
        `Create CloudWatch Logs subscription filters in every account that stream logs to Amazon Data Firehose and into a central Amazon OpenSearch Service domain.`,
        `Create an IAM role in each account that operators assume to view that account's CloudWatch console during incidents.`,
        `Export CloudWatch logs and metrics from each account to S3 nightly and query them with Amazon Athena.`
      ],
      answer: [0],
      explanation: `<b>A is correct.</b> Cross-account observability lets a monitoring account natively view and query metrics, logs and traces from linked source accounts, and an Organizations-based setup links new accounts automatically – no copying pipeline.<br><b>B</b> works for logs only, requires building and running a pipeline, and does not cover metrics or traces.<br><b>C</b> still means switching between 35 consoles, which is the current problem.<br><b>D</b> is batch (not real time) and does not support live dashboards or traces.`
    },
    {
      id: 'sap-030', domain: 'improve', lesson: 'p-observability-performance', multi: false,
      question: `A company migrated an order API to AWS Lambda backed by Amazon Aurora PostgreSQL. Under load, the database logs show thousands of short-lived connections, CPU is high from connection setup, and Lambda invocations intermittently fail with "too many connections" errors. Queries themselves are fast. Which change addresses the root cause with the least application change?`,
      options: [
        `Increase the max_connections parameter and scale the Aurora writer to a larger instance class.`,
        `Add Aurora Replicas and direct all queries to the reader endpoint.`,
        `Place Amazon RDS Proxy between the Lambda functions and the Aurora cluster, and use IAM authentication to the proxy.`,
        `Configure reserved concurrency of 1 on the Lambda function.`
      ],
      answer: [2],
      explanation: `<b>C is correct.</b> RDS Proxy pools and reuses database connections, absorbing connection storms from highly concurrent Lambda functions; only the endpoint (and optionally auth) changes.<br><b>A</b> is expensive and only postpones the problem; connection setup overhead remains.<br><b>B</b> does not help writes and still creates many connections.<br><b>D</b> fixes connections by destroying throughput – the API could no longer scale.`
    },
    {
      id: 'sap-031', domain: 'improve', lesson: 'p-reliability-chaos', multi: true,
      question: `A company wants to run chaos experiments with AWS Fault Injection Service (FIS) against its production order service, which runs on EC2 instances in an Auto Scaling group across three Availability Zones. Leadership approved the experiments only if customer impact is strictly limited and experiments stop automatically if customers are affected. Which actions should the solutions architect take? (Choose TWO.)`,
      options: [
        `Run the experiments using an IAM role with the AdministratorAccess policy so that every action succeeds.`,
        `Define stop conditions in the experiment template that reference CloudWatch alarms on the service's customer-facing error rate and latency.`,
        `Disable CloudWatch alarms during experiments to avoid paging the on-call engineer.`,
        `Target a small, tagged subset of instances (for example, a percentage of instances in one Availability Zone) and use an experiment role scoped to only the required FIS actions.`,
        `Target all instances in the Auto Scaling group at once to validate worst-case behavior first.`
      ],
      answer: [1, 3],
      explanation: `<b>B and D are correct.</b> Stop conditions halt the experiment automatically when customer-facing alarms breach, and limiting targets plus a least-privilege experiment role constrains the blast radius.<br><b>A</b> violates least privilege and increases the blast radius of a mistake.<br><b>C</b> removes the signal that stop conditions and responders depend on.<br><b>E</b> maximizes customer impact, the opposite of the requirement; start small and expand.`
    },
    {
      id: 'sap-032', domain: 'improve', lesson: 'p-reliability-chaos', multi: false,
      question: `A company's leadership defined an RTO of 30 minutes and an RPO of 5 minutes for 40 business applications deployed with CloudFormation. The architecture team needs to determine which applications currently cannot meet these targets, get prioritized recommendations, and track resilience posture over time as the applications change. Which service should the solutions architect use?`,
      options: [
        `AWS Trusted Advisor fault tolerance checks.`,
        `AWS Well-Architected Tool with the Reliability Pillar questions answered for each application.`,
        `AWS Fault Injection Service experiments for each application.`,
        `AWS Resilience Hub with a resiliency policy defining the RTO and RPO, and applications imported from their CloudFormation stacks.`
      ],
      answer: [3],
      explanation: `<b>D is correct.</b> Resilience Hub assesses each application against a resiliency policy with explicit RTO/RPO targets, reports whether targets are met, provides recommendations, and can be re-run to track drift.<br><b>A</b> gives generic best-practice checks, not RTO/RPO assessments per application.<br><b>B</b> is a question-driven review process, not an automated assessment against numeric targets.<br><b>C</b> validates behavior under failure but does not calculate whether RTO/RPO targets can be met or produce recommendations by itself.`
    },
    {
      id: 'sap-033', domain: 'improve', lesson: 'p-reliability-chaos', multi: true,
      question: `A web application runs on EC2 instances in an Auto Scaling group across three Availability Zones behind an Application Load Balancer, sized to 60% average CPU. During a recent AZ impairment, instances in the affected AZ were degraded but still passed health checks, and the Auto Scaling group took too long to launch replacement capacity in the healthy AZs. Which actions will improve resilience to future AZ impairments? (Choose TWO.)`,
      options: [
        `Provision enough capacity so that the instances in any two Availability Zones can carry the full peak load (static stability).`,
        `Rely on target tracking scaling with a lower CPU target so that the group scales out faster during the event.`,
        `Consolidate into a single Availability Zone with larger instances to reduce cross-AZ dependencies.`,
        `Lengthen the load balancer health check interval and unhealthy threshold to avoid false failures.`,
        `Enable Route 53 ARC zonal autoshift (and use zonal shift for manual action) on the load balancer so that traffic is moved away from an impaired Availability Zone.`
      ],
      answer: [0, 4],
      explanation: `<b>A and E are correct.</b> Static stability pre-provisions capacity so losing an AZ does not require control-plane scaling actions during the event, and zonal shift/autoshift moves traffic away from a degraded AZ even when its instances still pass health checks.<br><b>B</b> still depends on launching capacity during the event – the exact failure observed.<br><b>C</b> removes AZ redundancy entirely.<br><b>D</b> makes detection slower, worsening gray failures.`
    },
    {
      id: 'sap-034', domain: 'improve', lesson: 'p-cost-optimization-governance', multi: false,
      question: `A company enforces a CostCenter tag on all resources in 60 member accounts by using tag policies and an SCP that denies resource creation without the tag. Two months later, the finance team reports that the CostCenter tag is not available as a dimension in AWS Cost Explorer or in the Cost and Usage Report. What should the solutions architect do?`,
      options: [
        `In the management account, activate CostCenter as a user-defined cost allocation tag; it will appear in billing data from activation onward.`,
        `Activate the tag as a cost allocation tag in each member account's Billing console.`,
        `Recreate the tag policies with enforcement for all resource types; enforcement automatically activates tags for billing.`,
        `Re-tag all resources with an aws: prefixed tag key so that AWS treats it as an AWS-generated cost allocation tag.`
      ],
      answer: [0],
      explanation: `<b>A is correct.</b> User-defined tags must be activated as cost allocation tags in the management (payer) account before they appear in Cost Explorer and CUR, and they apply going forward (not retroactively by default).<br><b>B</b> in an organization, activation is done from the management account.<br><b>C</b> tag policies standardize tags but do not activate them for billing.<br><b>D</b> the aws: prefix is reserved for AWS and cannot be used for user tags.`
    },
    {
      id: 'sap-035', domain: 'improve', lesson: 'p-cost-optimization-governance', multi: true,
      question: `A company spends steadily on compute and plans to move many EC2-based services to AWS Fargate and AWS Lambda over the next year, possibly changing instance families and Regions for the remaining EC2 workloads. Separately, its disaster recovery plan requires that a specific number of m6i instances be guaranteed launchable in one Availability Zone in the DR Region at any time. The company wants to maximize savings while meeting both needs. Which purchasing options should the solutions architect recommend? (Choose TWO.)`,
      options: [
        `Standard Reserved Instances (regional) for the current EC2 instance families.`,
        `EC2 Instance Savings Plans for the m6i family in the primary Region.`,
        `Compute Savings Plans sized to the steady compute baseline.`,
        `A Spot Fleet in the DR Region configured for capacity-optimized allocation.`,
        `On-Demand Capacity Reservations for the required m6i instances in the DR Availability Zone.`
      ],
      answer: [2, 4],
      explanation: `<b>C and E are correct.</b> Compute Savings Plans apply across EC2 families, sizes and Regions as well as Fargate and Lambda, so the discount follows the migration. Capacity Reservations are the only option here that guarantees capacity in a specific AZ (and Savings Plans discounts can apply to them).<br><b>A</b> and <b>B</b> lock the discount to specific families/Regions that are expected to change, and do not cover Fargate or Lambda.<br><b>D</b> Spot capacity can be interrupted or unavailable, so it cannot guarantee DR capacity.`
    },
    {
      id: 'sap-036', domain: 'improve', lesson: 'p-cost-optimization-governance', multi: false,
      question: `A holding company consolidates billing for its subsidiaries in one AWS organization. One subsidiary is being prepared for divestiture and must report its true standalone AWS costs; it must not benefit from Reserved Instances or Savings Plans purchased by other subsidiaries, and its own commitments should not be shared outward. The subsidiary must remain in the organization for now. What should the solutions architect do?`,
      options: [
        `Move the subsidiary's accounts into a separate OU and attach an SCP that denies use of Savings Plans.`,
        `Use AWS Cost Categories to separate the subsidiary's costs; this automatically recalculates discounts.`,
        `In the management account's billing preferences, turn off RI and Savings Plans discount sharing for the subsidiary's accounts.`,
        `Ask the subsidiary to purchase its own Savings Plans so that they take precedence over shared ones.`
      ],
      answer: [2],
      explanation: `<b>C is correct.</b> Discount sharing can be turned off per account from the management account, so those accounts neither receive nor share RI and Savings Plans benefits while staying in the organization.<br><b>A</b> SCPs control API permissions, not billing discount application.<br><b>B</b> Cost Categories group costs for reporting but do not change how discounts are applied.<br><b>D</b> commitments apply first to the purchasing account but leftover shared discounts from others would still apply, and its own unused commitment would still be shared.`
    },
    {
      id: 'sap-037', domain: 'improve', lesson: 'p-cost-optimization-governance', multi: false,
      question: `A FinOps team needs hourly, resource-level cost data for all 200 accounts in the organization, including amortized Savings Plans costs and tags, and wants analysts to query it with SQL and build dashboards. The solution must not require custom code to collect data from each account. What should the solutions architect recommend?`,
      options: [
        `Enable Cost Explorer in each member account and export CSV reports weekly.`,
        `Create a CUR 2.0 export with AWS Data Exports in the management account, delivered to S3 in Parquet with resource IDs, then query it with Amazon Athena and visualize it in Amazon QuickSight.`,
        `Create an AWS Budget per account with notifications to an SNS topic subscribed by a Lambda function that writes to DynamoDB.`,
        `Use AWS Trusted Advisor cost optimization checks and export the results to S3.`
      ],
      answer: [1],
      explanation: `<b>B is correct.</b> A CUR 2.0 export from the management account covers every linked account at line-item granularity, including resource IDs, tags and amortized commitment costs; Athena gives SQL and QuickSight provides dashboards (for example the Cloud Intelligence Dashboards).<br><b>A</b> is manual, per account and not line-item.<br><b>C</b> Budgets track thresholds, not detailed cost data, and need custom code.<br><b>D</b> Trusted Advisor provides recommendations, not cost and usage data.`
    },
    {
      id: 'sap-038', domain: 'improve', lesson: 'p-deployment-strategies', multi: false,
      question: `A company deploys new versions of a business-critical AWS Lambda function weekly through AWS CodePipeline. A recent faulty release was shifted to 100% of traffic immediately and caused a 40-minute outage. The company wants new versions exposed to a small share of traffic first, with automatic rollback if errors increase, and with no duplicate infrastructure to manage. What should the solutions architect implement?`,
      options: [
        `Deploy the new version to a separate AWS account and use Route 53 weighted records to send 10% of traffic to it.`,
        `Use the Lambda console to publish a new version and manually update the alias after reviewing CloudWatch metrics.`,
        `Use CloudFormation stack updates with a rollback trigger that monitors Lambda duration metrics.`,
        `Use AWS CodeDeploy with a Lambda canary deployment configuration (for example, LambdaCanary10Percent5Minutes) that shifts alias traffic, with CloudWatch alarms on errors configured for automatic rollback.`
      ],
      answer: [3],
      explanation: `<b>D is correct.</b> CodeDeploy shifts a small percentage of alias traffic to the new version, monitors CloudWatch alarms, and rolls back automatically if they fire – no duplicate infrastructure.<br><b>A</b> duplicates infrastructure in another account and DNS caching makes rollback slow.<br><b>B</b> is manual and still all-at-once when the alias changes.<br><b>C</b> CloudFormation rollback triggers act on the stack update as a whole; without traffic shifting, all traffic still hits the new version immediately.`
    },
    {
      id: 'sap-039', domain: 'improve', lesson: 'p-deployment-strategies', multi: true,
      question: `A platform team must deploy a standard set of IAM roles, an AWS Config conformance pack, and VPC flow log settings to every account in the organization, including accounts created in the future, across four Regions. The team operates from a shared deployment account and must not log in to the management account for routine work. Which combination of steps meets these requirements with the least operational overhead? (Choose TWO.)`,
      options: [
        `Create a CloudFormation StackSet with service-managed permissions that targets the organization root (or the relevant OUs) in the four Regions with automatic deployment enabled.`,
        `Create a CloudFormation StackSet with self-managed permissions and manually add new accounts as stack instances after they are created.`,
        `Use AWS Config conformance packs alone to create the IAM roles and flow log settings in all accounts.`,
        `Register the shared deployment account as a delegated administrator for CloudFormation StackSets in AWS Organizations.`,
        `Create an EventBridge rule on account creation that invokes a Lambda function to assume a role in each new account and run CloudFormation.`
      ],
      answer: [0, 3],
      explanation: `<b>A and D are correct.</b> Service-managed StackSets use Organizations to create the necessary roles and automatically deploy to accounts added to target OUs; registering a delegated administrator lets the team operate from the deployment account.<br><b>B</b> requires manual role setup and manual addition of every new account.<br><b>C</b> conformance packs deploy Config rules and remediations; they are not a general mechanism for creating IAM roles or flow log configuration.<br><b>E</b> works but is custom code to build and maintain – exactly what auto-deployment already provides.`
    },
    {
      id: 'sap-040', domain: 'improve', lesson: 'p-deployment-strategies', multi: false,
      question: `A company must upgrade a production Amazon RDS for MySQL database to a new major version. Previous in-place upgrades caused over an hour of downtime and could not be easily rolled back. The company wants to test the upgraded database with production data before cutover and limit write downtime to about a minute. Which approach meets these requirements?`,
      options: [
        `Use Amazon RDS Blue/Green Deployments to create a green environment on the new major version that stays synchronized with the blue environment, test it, then perform a switchover.`,
        `Take a snapshot, restore it on the new version, and point the application to the restored instance after testing.`,
        `Create a Multi-AZ standby and perform the major version upgrade, which upgrades the standby first and then fails over.`,
        `Use AWS DMS to replicate to a new RDS for MySQL instance on the new version and update DNS records with a 24-hour TTL.`
      ],
      answer: [0],
      explanation: `<b>A is correct.</b> RDS Blue/Green Deployments create a synchronized staging (green) copy using replication, allow testing, and switch over typically in about a minute while keeping the old environment for fallback.<br><b>B</b> loses all writes made after the snapshot unless the application is stopped for the entire test period.<br><b>C</b> is wrong because a Multi-AZ major version upgrade upgrades both primary and standby at the same time, causing downtime.<br><b>D</b> adds operational overhead, and a 24-hour TTL would make cutover and rollback slow.`
    },
    // ---------------- migrate ----------------
    {
      id: 'sap-041', domain: 'migrate', lesson: 'p-migration-strategy', multi: false,
      question: `A company must exit its colocation data center in six months when the lease expires. The estate includes 500 Windows and Linux servers running on VMware and on physical hardware, hosting dozens of applications. The company plans to modernize some applications later but wants the fastest migration with minimal changes and minimal downtime per server now. Which approach should the solutions architect recommend?`,
      options: [
        `Refactor each application into containers on Amazon ECS before migrating.`,
        `Rehost the servers by using AWS Application Migration Service with continuous block-level replication, testing launches in AWS, and cutting over in dependency-based waves.`,
        `Export each VM as an OVA file, upload it to Amazon S3, and use VM Import/Export to create AMIs.`,
        `Repurchase SaaS equivalents for every application.`
      ],
      answer: [1],
      explanation: `<b>B is correct.</b> A hard deadline and large estate favor rehosting; Application Migration Service supports physical and virtual servers, replicates continuously so cutover downtime is minutes, and supports non-disruptive test launches.<br><b>A</b> refactoring 500 servers in six months is unrealistic and contradicts "minimal changes".<br><b>C</b> VM Import does not cover physical servers and requires downtime for each export and upload with no continuous sync.<br><b>D</b> SaaS equivalents do not exist for most custom applications.`
    },
    {
      id: 'sap-042', domain: 'migrate', lesson: 'p-migration-strategy', multi: false,
      question: `A company is planning migration waves for 300 physical Linux and Windows servers that do not run on any hypervisor. The migration team must identify which servers communicate with each other (including ports and processes) so that tightly coupled servers move together, and must track migration progress centrally. What should the solutions architect recommend?`,
      options: [
        `Deploy the AWS Application Discovery Service Agentless Collector in the data center and import data into AWS Migration Hub.`,
        `Use Migration Evaluator to generate a business case.`,
        `Install the AWS Application Discovery Service Discovery Agent on each server and use AWS Migration Hub to visualize network connections and group servers into applications.`,
        `Enable VPC Flow Logs in the target VPC and analyze them after migration.`
      ],
      answer: [2],
      explanation: `<b>C is correct.</b> The Discovery Agent runs on the servers themselves, works on physical hosts, and collects process and network connection data that Migration Hub visualizes to build application groupings and waves.<br><b>A</b> the Agentless Collector collects inventory through VMware vCenter, so it cannot discover physical servers.<br><b>B</b> produces cost projections, not dependency maps.<br><b>D</b> captures traffic only after migration, which is too late for wave planning, and only within AWS.`
    },
    {
      id: 'sap-043', domain: 'migrate', lesson: 'p-server-database-migration', multi: true,
      question: `A company is migrating a 4 TB Oracle Database that uses many PL/SQL stored procedures to Amazon Aurora PostgreSQL to eliminate Oracle licensing. The business allows a maximum of 30 minutes of downtime during cutover. Which combination of steps should the solutions architect include in the migration plan? (Choose TWO.)`,
      options: [
        `Use Oracle Data Pump to export the database and import the dump file directly into Aurora PostgreSQL.`,
        `Use DMS Schema Conversion (or AWS SCT) to convert the schema and PL/SQL code to PostgreSQL, and remediate items flagged in the assessment report.`,
        `Use AWS DMS with a full-load-only task during a weekend outage window.`,
        `Use AWS Application Migration Service to replicate the Oracle database server to EC2.`,
        `Use AWS DMS with a full load and change data capture (CDC) task, with supplemental logging enabled on the source, and cut over when replication lag is near zero.`
      ],
      answer: [1, 4],
      explanation: `<b>B and E are correct.</b> Heterogeneous migrations require converting schema and procedural code with DMS Schema Conversion or SCT; DMS full load plus CDC keeps the target in sync so cutover downtime is minutes.<br><b>A</b> Data Pump files can only be imported into Oracle, not PostgreSQL.<br><b>C</b> a full load of 4 TB with no CDC would far exceed 30 minutes of downtime.<br><b>D</b> rehosting Oracle on EC2 keeps Oracle licensing, contradicting the goal.`
    },
    {
      id: 'sap-044', domain: 'migrate', lesson: 'p-data-transfer', multi: false,
      question: `A research lab must move 500 TB of files from an on-premises NAS to Amazon S3 within four weeks. The lab has a 1 Gbps internet connection, of which only about 40% can be used for migration during business hours, and new files are created daily that must also be transferred before cutover. Direct Connect cannot be provisioned in time. Which approach meets the deadline?`,
      options: [
        `Use AWS DataSync over the internet connection with bandwidth throttling for the entire 500 TB.`,
        `Enable S3 Transfer Acceleration and upload with parallel multipart uploads over the internet connection.`,
        `Deploy an S3 File Gateway on premises and copy all files to the gateway share.`,
        `Order multiple AWS Snowball Edge Storage Optimized devices in parallel for the bulk data, then use AWS DataSync over the network to transfer files changed after the devices were loaded and for the final incremental sync.`
      ],
      answer: [3],
      explanation: `<b>D is correct.</b> At 1 Gbps the link moves roughly 10.8 TB per day at full utilization; at about 40% that is only about 4–5 TB per day, so 500 TB would take over three months. Offline transfer on parallel Snowball Edge devices handles the bulk, and DataSync handles the delta.<br><b>A</b> and <b>C</b> are bound by the same limited network bandwidth and cannot finish in four weeks.<br><b>B</b> Transfer Acceleration optimizes long-distance paths but cannot exceed the local link capacity.`
    },
    {
      id: 'sap-045', domain: 'migrate', lesson: 'p-data-transfer', multi: false,
      question: `A logistics company receives files from 300 trading partners through an on-premises SFTP server that authenticates users against the corporate Active Directory. The company is moving its processing pipeline to AWS and wants files to land directly in Amazon S3 to trigger processing. Partners must not change their SFTP clients, hostnames (via DNS CNAME), or credentials, and the company wants no servers to manage. What should the solutions architect recommend?`,
      options: [
        `Create an AWS Transfer Family SFTP server with Amazon S3 as the storage backend, use AWS Directory Service (AD Connector or AWS Managed Microsoft AD) for authentication, and point the partner-facing hostname at the server endpoint.`,
        `Run an SFTP server on Amazon EC2 in an Auto Scaling group that mounts S3 with a FUSE file system.`,
        `Ask partners to upload with the AWS CLI using IAM users created for each partner.`,
        `Deploy AWS DataSync agents at each partner site to copy files into S3.`
      ],
      answer: [0],
      explanation: `<b>A is correct.</b> Transfer Family provides a fully managed SFTP endpoint backed by S3, supports Microsoft AD authentication through Directory Service, and allows custom hostnames, so partners keep their clients and credentials; S3 events trigger processing.<br><b>B</b> is a self-managed server fleet with fragile S3 mounting.<br><b>C</b> forces partners to change tools and credentials.<br><b>D</b> requires installing agents at 300 partner sites, which the company does not control.`
    },
    {
      id: 'sap-046', domain: 'migrate', lesson: 'p-data-transfer', multi: false,
      question: `A company must perform a one-time migration of 40 TB from an on-premises NFS file server to Amazon EFS over an existing 10 Gbps Direct Connect connection. The migration must preserve file metadata, verify data integrity, run on a schedule that limits bandwidth during business hours, and transfer data privately without traversing the internet. Which solution requires the least operational effort?`,
      options: [
        `Mount EFS on an on-premises server over Direct Connect and run rsync in parallel cron jobs.`,
        `Ship the data on an AWS Snowball Edge device and import it into EFS.`,
        `Deploy an AWS DataSync agent on premises, configure a DataSync task from the NFS location to the EFS location using a VPC interface endpoint for DataSync, and set bandwidth limits and a schedule.`,
        `Deploy an Amazon S3 File Gateway, copy data to it, and then use S3 Batch Operations to copy objects into EFS.`
      ],
      answer: [2],
      explanation: `<b>C is correct.</b> DataSync is purpose-built for NFS-to-EFS transfers with metadata preservation, integrity verification, scheduling, bandwidth throttling, and private connectivity via a VPC endpoint over Direct Connect.<br><b>A</b> requires custom scripting, monitoring and verification.<br><b>B</b> is unnecessary with 10 Gbps available (40 TB takes under a day at full rate) and Snowball imports into S3, not EFS.<br><b>D</b> is convoluted; S3 Batch Operations does not copy objects into EFS file systems.`
    },
    {
      id: 'sap-047', domain: 'migrate', lesson: 'p-modernization', multi: false,
      question: `A company runs several Java applications that exchange messages through a self-managed Apache ActiveMQ cluster using JMS and OpenWire. The company wants to migrate to AWS quickly, reduce operational burden of the broker, and avoid changing application messaging code. What should the solutions architect recommend?`,
      options: [
        `Replace ActiveMQ with Amazon SQS and rewrite the producers and consumers to use the AWS SDK.`,
        `Migrate to Amazon MQ for ActiveMQ with an active/standby broker deployment across two Availability Zones.`,
        `Replace ActiveMQ with Amazon Kinesis Data Streams.`,
        `Run ActiveMQ on EC2 instances in an Auto Scaling group with EBS volumes.`
      ],
      answer: [1],
      explanation: `<b>B is correct.</b> Amazon MQ is a managed broker compatible with ActiveMQ protocols (JMS, OpenWire, AMQP, MQTT, STOMP), so applications need only endpoint changes, and active/standby provides high availability.<br><b>A</b> and <b>C</b> require code rewrites.<br><b>D</b> keeps the operational burden of managing the broker.`
    },
    {
      id: 'sap-048', domain: 'migrate', lesson: 'p-modernization', multi: true,
      question: `A retailer runs a large monolithic e-commerce application on EC2 after a recent rehost. The business wants to release new checkout and recommendation features weekly, while the monolith can only be deployed monthly. Leadership rejects a full rewrite because of risk. Which approaches should the solutions architect recommend? (Choose TWO.)`,
      options: [
        `Freeze feature work for 18 months and rewrite the entire application as microservices, then cut over in one release.`,
        `Have new microservices read and write directly to the monolith's database tables to avoid data migration.`,
        `Place Amazon API Gateway (or ALB listener rules) in front of the monolith and route specific paths, such as /checkout, to new services as they are built, following the strangler fig pattern.`,
        `Build the new checkout and recommendation capabilities as independently deployable services with their own data stores, integrating with the monolith through events (for example, Amazon EventBridge) and an anti-corruption layer.`,
        `Move the monolith to a larger EC2 instance type to speed up its build and deployment.`
      ],
      answer: [2, 3],
      explanation: `<b>C and D are correct.</b> The strangler fig pattern lets traffic for specific capabilities move incrementally to new services, and giving those services their own data and event-based integration enables independent weekly deployment without a big-bang rewrite.<br><b>A</b> is the high-risk big-bang rewrite leadership rejected.<br><b>B</b> shared database tables couple the services to the monolith's schema and release cycle.<br><b>E</b> does not change the coupled release process.`
    },
    {
      id: 'sap-049', domain: 'migrate', lesson: 'p-modernization', multi: false,
      question: `A company runs a .NET application on Microsoft SQL Server Enterprise and wants to eliminate SQL Server licensing by moving to an open-source-compatible managed database. The application contains thousands of T-SQL queries embedded in code, and the team has limited time for application changes. Which solution minimizes application changes?`,
      options: [
        `Migrate to Amazon RDS for SQL Server Standard Edition with License Included.`,
        `Migrate to Amazon DynamoDB and rewrite the data access layer.`,
        `Migrate to Amazon Aurora MySQL with AWS SCT and rewrite the T-SQL queries to MySQL syntax.`,
        `Migrate to Amazon Aurora PostgreSQL with Babelfish enabled, using the Babelfish Compass tool to assess compatibility, so the application can keep using T-SQL and the SQL Server wire protocol.`
      ],
      answer: [3],
      explanation: `<b>D is correct.</b> Babelfish for Aurora PostgreSQL accepts T-SQL over the TDS (SQL Server) protocol, so most queries keep working with minimal changes, and Babelfish Compass identifies unsupported features beforehand.<br><b>A</b> still pays SQL Server licensing (included in the price).<br><b>B</b> requires a complete redesign of data access.<br><b>C</b> requires rewriting thousands of queries.`
    },
    {
      id: 'sap-050', domain: 'migrate', lesson: 'p-modernization', multi: false,
      question: `An insurer runs critical COBOL batch and CICS online applications on an IBM mainframe whose hardware contract ends in 18 months. The company has an experienced COBOL development team and wants to keep developing in COBOL for now, while moving off the mainframe hardware onto a managed AWS environment. Which approach best fits these requirements?`,
      options: [
        `Use AWS Mainframe Modernization with the replatform pattern, recompiling the COBOL applications to run on a mainframe-compatible runtime (such as the Rocket Software runtime) in a managed environment.`,
        `Use automated refactoring (AWS Blu Age through AWS Transform for mainframe) to convert all COBOL code to Java.`,
        `Use AWS Application Migration Service to replicate the mainframe to EC2 instances.`,
        `Rewrite all applications as AWS Lambda functions in Python before the hardware contract ends.`
      ],
      answer: [0],
      explanation: `<b>A is correct.</b> Replatforming keeps COBOL source code and skills while moving execution to a managed, mainframe-compatible runtime on AWS, which is achievable within the timeline.<br><b>B</b> converts code to Java, conflicting with the requirement to keep developing in COBOL (though it is a valid path for companies leaving COBOL).<br><b>C</b> Application Migration Service replicates x86 servers, not mainframe systems.<br><b>D</b> a full rewrite in 18 months is high risk and abandons the COBOL team's skills.`
    }
  ]
};
