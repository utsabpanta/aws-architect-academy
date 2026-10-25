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
<li><strong>AWS Cloud WAN</strong> builds a global core network from a single declarative network policy with <strong>segments</strong> (for example prod, dev, shared) and automatic route propagation between Regions – the better fit when TGW peering meshes and static routes across many Regions become hard to manage.</li>
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
            `If a stateful firewall in an inspection VPC drops return traffic, think TGW appliance mode.`,
            `If a global network across many Regions needs segment-based isolation managed from one policy, think AWS Cloud WAN rather than a hand-built TGW peering mesh.`
          ],
          services: ['AWS Transit Gateway', 'AWS Direct Connect', 'AWS Site-to-Site VPN', 'Amazon VPC', 'AWS Resource Access Manager', 'AWS Cloud WAN']
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
        },
        {
          id: 'p-identity-federation',
          title: 'Identity Federation Deep Dive: Identity Center, ABAC, Cognito & Delegated Administration',
          minutes: 18,
          summary: `Federate workforce identities into many accounts, scale authorization with attributes instead of roles, pick the right Cognito component for customer identities, and let teams create IAM roles without letting them escalate privileges.`,
          sections: [
            {
              heading: 'IAM Identity Center architecture',
              html: `<p>An <strong>organization instance</strong> of IAM Identity Center is the standard way to give workforce users access to many AWS accounts and to Identity Center-integrated applications. (Account instances exist only for isolated application use and cannot assign access to AWS accounts.) Each instance has exactly <strong>one identity source</strong> at a time.</p>
<table><thead><tr><th>Identity source</th><th>Authentication</th><th>Provisioning</th><th>Fits</th></tr></thead><tbody>
<tr><td>Identity Center directory</td><td>Identity Center (with MFA)</td><td>Manual, API or scripted</td><td>Small organizations with no corporate IdP</td></tr>
<tr><td>Active Directory (AWS Managed Microsoft AD, or self-managed AD through AD Connector)</td><td>Active Directory</td><td>Configurable AD sync of selected users and groups</td><td>AD-centric enterprises</td></tr>
<tr><td>External IdP (Microsoft Entra ID, Okta, Ping, Google Workspace…)</td><td><strong>SAML 2.0</strong></td><td><strong>SCIM</strong> automatic provisioning and deprovisioning</td><td>Most enterprises</td></tr>
</tbody></table>
<ul>
<li><strong>Permission sets</strong> combine AWS managed policies, <strong>customer managed policies referenced by name</strong> (a policy with that name and path must already exist in every target account), an inline policy, and optionally a <strong>permissions boundary</strong>. Assigning a group plus a permission set to an account creates an <code>AWSReservedSSO_</code> role there.</li>
<li>Run Identity Center from a <strong>delegated administrator</strong> account so day-to-day administration avoids the management account.</li>
<li><strong>Trusted identity propagation</strong> passes the end user's identity to services such as Amazon Redshift, Athena with Lake Formation, S3 Access Grants and Amazon Q Business, so data access can be authorized per user rather than per shared role.</li>
</ul>
<div class="callout warn">Changing the identity source (for example from the Identity Center directory to Entra ID) can remove existing users, groups and assignments. Treat it as a planned migration, not a toggle.</div>`
            },
            {
              heading: 'Attribute-based access control with session tags',
              html: `<p>Role-based access control needs a new role or permission set for every project. <strong>ABAC</strong> writes one policy that compares the caller's tags with the resource's tags, so new projects need only new tags.</p>
<ul>
<li><strong>Where principal tags come from:</strong> Identity Center <em>attributes for access control</em> (mapped from SAML assertion or SCIM attributes such as <code>costCenter</code>), the <code>PrincipalTag</code> SAML attribute in direct IAM SAML federation, or <code>sts:TagSession</code> on <code>AssumeRole</code>. <strong>Transitive</strong> session tags persist through role chaining.</li>
<li><strong>Core condition:</strong> <code>"aws:ResourceTag/project": "&#36;{aws:PrincipalTag/project}"</code>.</li>
<li><strong>Control tagging on create:</strong> require <code>aws:RequestTag/project</code> to equal the principal's tag and limit keys with <code>aws:TagKeys</code>, otherwise users can create untagged or mis-tagged resources.</li>
<li><strong>Protect the tags:</strong> deny changing or removing the authorization tags on existing resources except for an admin role, or a user can retag a resource into their own project.</li>
</ul>
<table><thead><tr><th></th><th>RBAC</th><th>ABAC</th></tr></thead><tbody>
<tr><td>New project</td><td>New role / permission set and policy</td><td>New tag value only</td></tr>
<tr><td>Policy count</td><td>Grows with teams × resources</td><td>Small and stable</td></tr>
<tr><td>Risk</td><td>Policy sprawl</td><td>Tag governance must be enforced</td></tr>
</tbody></table>`
            },
            {
              heading: 'Customer identities: Cognito user pools vs identity pools',
              html: `<table><thead><tr><th></th><th>Cognito user pools</th><th>Cognito identity pools</th></tr></thead><tbody>
<tr><td>Purpose</td><td>User directory and authentication: sign-up, sign-in, MFA, managed login pages</td><td>Authorization to AWS services by issuing <strong>temporary AWS credentials</strong></td></tr>
<tr><td>Output</td><td>JWTs (ID, access, refresh tokens)</td><td>STS credentials for an IAM role</td></tr>
<tr><td>Federation</td><td>Social (Google, Apple, Facebook, Amazon), SAML and OIDC IdPs into the pool</td><td>Accepts user pool, social, SAML, OIDC and developer-authenticated identities; optional guest (unauthenticated) access</td></tr>
<tr><td>Typical integration</td><td>API Gateway Cognito authorizer, ALB authenticate action, AppSync</td><td>Mobile or browser clients calling S3, DynamoDB or IoT directly</td></tr>
</tbody></table>
<ul>
<li>Use them <strong>together</strong>: the user pool authenticates, the identity pool exchanges the token for role credentials.</li>
<li>Isolate per-user data with the policy variable <code>&#36;{cognito-identity.amazonaws.com:sub}</code> in the authenticated role's policy (for example an S3 prefix per user), and use role-mapping rules or principal tags for ABAC.</li>
<li>For fine-grained, application-level authorization decisions (who can approve which claim), use <strong>Amazon Verified Permissions</strong> with Cedar policies rather than encoding logic in IAM.</li>
<li>Multi-tenant B2B SaaS: federate each tenant's SAML/OIDC IdP into a user pool and carry the tenant ID in a claim; choose a pool per tenant only when tenants need very different settings.</li>
</ul>
<div class="callout">Cognito is for <strong>application end users</strong>. Workforce access to the AWS console and CLI across accounts is IAM Identity Center.</div>`
            },
            {
              heading: 'Cross-account patterns and delegated admin with permissions boundaries',
              html: `<ul>
<li><strong>Hub-and-spoke role assumption:</strong> a tooling or pipeline account assumes a well-known role in each target account; trust policies can trust a whole OU with <code>aws:PrincipalOrgPaths</code> or the org with <code>aws:PrincipalOrgID</code>.</li>
<li><strong>Role chaining</strong> limits the chained session to a maximum of one hour; use <code>sts:SourceIdentity</code> so CloudTrail shows the original human through the chain.</li>
<li><strong>IAM Roles Anywhere</strong> gives on-premises workloads temporary credentials using X.509 certificates from a trusted CA (AWS Private CA or your own), removing long-term access keys from servers.</li>
<li>Third parties: role with <code>sts:ExternalId</code>. Data sharing: resource policies, Lake Formation, or RAM.</li>
</ul>
<p><strong>Delegating IAM safely.</strong> App teams often need to create Lambda or ECS task roles. Give them <code>iam:CreateRole</code> and <code>iam:PutRolePolicy</code> only when <code>iam:PermissionsBoundary</code> equals a specific boundary policy ARN, then deny <code>iam:DeleteRolePermissionsBoundary</code>, deny editing the boundary policy itself, restrict role names or paths (for example <code>/app/</code>), and allow <code>iam:PassRole</code> only for roles on that path.</p>
<div class="callout">Effective permissions are the <strong>intersection</strong> of identity policy, permissions boundary, SCP and any session policy. A boundary never grants anything; it caps what the team's roles can ever do, so a developer cannot create a role more powerful than the boundary.</div>`
            },
            {
              heading: 'Reference scenario',
              html: `<p><strong>Scenario:</strong> a retailer with 400 accounts uses Entra ID. App teams wait days for central IAM tickets to create Lambda roles, access is granted per project with 300 permission sets, and a new customer mobile app must let shoppers upload receipts to S3.</p>
<ul>
<li>Identity Center (delegated admin in an Identity account) with Entra ID over SAML and SCIM; attributes for access control map <code>project</code> and <code>costCenter</code> to session tags; 300 permission sets collapse into a few ABAC permission sets.</li>
<li>The <code>AppDeveloper</code> permission set allows IAM role creation only with the mandatory permissions boundary and only under <code>/app/</code>; an SCP denies removing boundaries organization-wide.</li>
<li>The mobile app uses a Cognito user pool (email plus Apple/Google sign-in) and an identity pool whose authenticated role allows <code>s3:PutObject</code> only under the caller's own identity prefix.</li>
</ul>`
            }
          ],
          keyPoints: [
            `Identity Center + external IdP = SAML 2.0 for sign-in, SCIM for provisioning; one identity source per instance.`,
            `Customer managed policies in a permission set must exist by name in every target account.`,
            `ABAC compares aws:PrincipalTag with aws:ResourceTag; also control aws:RequestTag on create and protect tags from modification.`,
            `Cognito user pools authenticate and issue JWTs; identity pools exchange tokens for temporary AWS credentials.`,
            `Permissions boundaries plus an iam:PermissionsBoundary condition let teams create roles without privilege escalation.`,
            `Role chaining sessions last at most one hour; IAM Roles Anywhere removes access keys from on-premises servers.`
          ],
          examTips: [
            `If permissions must scale to many projects "without creating new roles or permission sets", think ABAC with session tags.`,
            `If an app's users sign in with social providers and then call S3 or DynamoDB directly, think user pool + identity pool.`,
            `If developers must create IAM roles but must not exceed a defined set of permissions, think permissions boundary enforced by an iam:PermissionsBoundary condition.`,
            `If a permission set fails to provision in some accounts, check whether its customer managed policy exists in those accounts.`,
            `If on-premises servers use long-term access keys, think IAM Roles Anywhere.`
          ],
          services: ['IAM Identity Center', 'IAM', 'AWS STS', 'Amazon Cognito', 'Amazon Verified Permissions', 'IAM Roles Anywhere', 'AWS Organizations']
        },
        {
          id: 'p-hybrid-edge',
          title: 'Hybrid & Edge Architectures: Outposts, Local Zones, Wavelength, Storage Gateway & Hybrid DNS',
          minutes: 17,
          summary: `Decide where AWS infrastructure should physically run, design Outposts for disconnection, choose the right Storage Gateway type, and keep DNS working across Region, edge and data center.`,
          sections: [
            {
              heading: 'Choosing where AWS runs',
              html: `<table><thead><tr><th>Option</th><th>Location</th><th>Use when</th><th>Watch out for</th></tr></thead><tbody>
<tr><td>Outposts racks</td><td>Your data center</td><td>Low latency to on-premises systems, local data processing, data residency, apps that must stay next to on-prem dependencies</td><td>Needs a service link to its parent Region; capacity fixed at order time</td></tr>
<tr><td>Outposts servers (1U/2U)</td><td>Branches, stores, factories</td><td>Small-footprint local compute</td><td>Smaller service set; instance storage</td></tr>
<tr><td>Local Zones</td><td>AWS-operated metro locations</td><td>Single-digit-millisecond latency to end users in a metro (rendering, gaming, real-time media); some residency needs</td><td>Opt-in; subset of services; Dedicated Local Zones for sovereign requirements</td></tr>
<tr><td>Wavelength Zones</td><td>Inside telecom 5G networks</td><td>Ultra-low latency to mobile and connected devices</td><td>Reached through a carrier gateway from the carrier network</td></tr>
<tr><td>Snowball Edge</td><td>Disconnected or rugged sites</td><td>Edge compute and data collection without reliable connectivity</td><td>Not a continuously connected extension of a Region</td></tr>
<tr><td>ECS Anywhere / EKS Anywhere / EKS Hybrid Nodes</td><td>Your own hardware</td><td>Run containers on existing servers with AWS tooling</td><td>You own hardware, capacity and its availability</td></tr>
</tbody></table>
<p>Local Zones and Wavelength Zones appear as extra zones of a parent Region: you extend a VPC by creating subnets in them. Outposts also extend a VPC – a subnet is created on the Outpost.</p>`
            },
            {
              heading: 'Designing Outposts',
              html: `<ul>
<li>The <strong>service link</strong> is an encrypted connection back to the parent Region that carries management (control plane) traffic and intra-VPC traffic to the Region. Provide redundant uplinks (for example Direct Connect plus a second path).</li>
<li>If the service link is lost, <strong>running instances keep running</strong> and local traffic continues, but you cannot launch or modify resources. Design for <strong>static stability</strong>: provision spare capacity on the Outpost in advance instead of relying on scaling during an outage.</li>
<li>The <strong>local gateway</strong> connects Outposts racks to your on-premises network; customer-owned IP (CoIP) pools give instances addresses routable on-premises.</li>
<li>Services on Outposts racks include EC2, EBS, S3 on Outposts, ECS, EKS, RDS, ElastiCache, EMR and ALB. <strong>EKS local clusters</strong> run the Kubernetes control plane on the Outpost so clusters tolerate disconnection.</li>
<li>An Outpost is a single fault domain, much like one Availability Zone. For high availability use two Outposts (anchored to different AZs) or fail over to the Region.</li>
</ul>
<div class="callout">There is no "EC2 Anywhere": running genuine EC2 instances on premises means Outposts. For your own servers, use Systems Manager hybrid activations (management), ECS Anywhere or EKS Hybrid Nodes (containers), and IAM Roles Anywhere (credentials).</div>`
            },
            {
              heading: 'Storage Gateway variants',
              html: `<table><thead><tr><th>Type</th><th>Protocol</th><th>Data stored in</th><th>Fits</th></tr></thead><tbody>
<tr><td>S3 File Gateway</td><td>NFS, SMB</td><td>S3 objects (one file = one object) with a local cache</td><td>File shares whose data should also be usable natively in S3 (analytics, lifecycle, archive)</td></tr>
<tr><td>Volume Gateway – cached</td><td>iSCSI</td><td>S3-backed volumes, hot data cached locally</td><td>Primary block data in AWS, local low-latency access to recent data</td></tr>
<tr><td>Volume Gateway – stored</td><td>iSCSI</td><td>Full dataset on premises; asynchronous point-in-time snapshots to AWS as EBS snapshots</td><td>Keep all data local, use AWS for backup and DR</td></tr>
<tr><td>Tape Gateway</td><td>iSCSI virtual tape library</td><td>Virtual tapes in S3, archived to S3 Glacier Flexible Retrieval or Glacier Deep Archive</td><td>Replace physical tape without changing backup software</td></tr>
</tbody></table>
<ul>
<li>Gateways run as a VM (VMware, Hyper-V, KVM) or on EC2; size the cache for the working set.</li>
<li>Objects written to the bucket directly (not through the gateway) appear in the share only after a cache refresh (<code>RefreshCache</code>, which can be automated).</li>
<li>Amazon FSx File Gateway is no longer available to new customers; for new designs, access FSx for Windows File Server directly over DX/VPN.</li>
</ul>`
            },
            {
              heading: 'Hybrid DNS across Region, edge and data center',
              html: `<ul>
<li>Subnets in Local Zones, Wavelength Zones and on Outposts belong to the parent VPC, so they use the same VPC Resolver, private hosted zones and Resolver rules as Region subnets.</li>
<li>Centralize <strong>inbound and outbound Resolver endpoints</strong> in a network account (multiple AZs), conditionally forward on-premises zones out and AWS zones in, and share forwarding rules or <strong>Route 53 Profiles</strong> with every VPC.</li>
<li>Avoid circular dependencies: on-premises resolvers must not forward AWS zones back to an endpoint that forwards them on-premises again.</li>
<li>Edge sites that must survive WAN loss need local DNS resolvers or caching for the names they depend on – a cloud-only resolver path is a hidden single point of failure.</li>
</ul>
<div class="callout warn">A low-latency edge deployment is pointless if every request still makes a DNS lookup or database call back to the Region. Check the whole request path, not just where compute runs.</div>`
            },
            {
              heading: 'Reference scenario',
              html: `<p><strong>Scenario:</strong> a manufacturer runs a manufacturing execution system (MES) that needs sub-10 ms latency to shop-floor controllers in 12 plants, must keep production data in-country, still backs up to physical tape, and engineers share CAD files over SMB.</p>
<ul>
<li>Outposts servers in each plant for the MES front end, with spare capacity pre-provisioned so the plant keeps running if the service link drops; an Outposts rack in the main data center hosts RDS on Outposts for residency.</li>
<li>Aggregated, anonymized telemetry flows to the Region for analytics.</li>
<li>Tape Gateway replaces the tape library without changing the backup software; S3 File Gateway serves CAD shares with S3 lifecycle to colder tiers.</li>
<li>Central Resolver endpoints and a Route 53 Profile give every VPC (including Outposts subnets) the same view of <code>corp.example</code> and AWS private zones; each plant keeps a local caching resolver.</li>
</ul>`
            }
          ],
          keyPoints: [
            `Outposts = AWS infrastructure in your facility, controlled from a parent Region over the service link.`,
            `Losing the service link keeps running workloads up but blocks control-plane changes, so pre-provision capacity.`,
            `Local Zones bring AWS close to metro end users; Wavelength puts it inside 5G carrier networks.`,
            `S3 File Gateway (NFS/SMB to S3), Volume Gateway cached or stored (iSCSI), Tape Gateway (VTL to Glacier tiers).`,
            `ECS Anywhere, EKS Anywhere and EKS Hybrid Nodes run containers on your own hardware; there is no EC2 Anywhere.`,
            `Edge subnets use the parent VPC's DNS; design local resolution for sites that must survive WAN loss.`
          ],
          examTips: [
            `If workloads must run in the company's own data center with the same AWS APIs, think Outposts, not Local Zones.`,
            `If users in a specific city need single-digit-millisecond latency and no Region is nearby, think Local Zones.`,
            `If the latency target is to mobile devices on a 5G network, think Wavelength.`,
            `If existing backup software writes to tape and must keep doing so, think Tape Gateway.`,
            `If on-premises apps need SMB/NFS access to data that must also be processed in S3, think S3 File Gateway.`
          ],
          services: ['AWS Outposts', 'AWS Local Zones', 'AWS Wavelength', 'AWS Storage Gateway', 'Amazon ECS Anywhere', 'Amazon EKS Anywhere', 'Amazon Route 53 Resolver']
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
<li>Order-placed events published to EventBridge; rules route to fulfillment (Step Functions Standard with a saga for payment and shipping), analytics (Amazon Data Firehose to S3) and a partner bus in another account.</li>
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
        },
        {
          id: 'p-data-analytics',
          title: 'Data Lakes & Analytics Platforms at Scale: Lake Formation, Glue, Athena, EMR, Redshift & Streaming',
          minutes: 20,
          summary: `Build a governed data lake on S3, share it across accounts with fine-grained control, and pick the right query, processing, warehousing and streaming services for each workload.`,
          sections: [
            {
              heading: 'Lake house building blocks',
              html: `<table><thead><tr><th>Layer</th><th>Service</th><th>Role</th></tr></thead><tbody>
<tr><td>Storage</td><td>Amazon S3 (raw / curated / consumption zones); open table formats such as Apache Iceberg, including S3 Tables</td><td>Durable, cheap, decoupled from compute</td></tr>
<tr><td>Catalog</td><td>AWS Glue Data Catalog (crawlers or explicit DDL)</td><td>Shared metadata for Athena, EMR, Glue, Redshift Spectrum</td></tr>
<tr><td>Governance</td><td>AWS Lake Formation</td><td>Database/table/column/row/cell permissions, LF-Tags, cross-account sharing</td></tr>
<tr><td>Batch ingest &amp; ETL</td><td>AWS Glue (serverless Spark), AWS DMS, DataSync, Amazon AppFlow</td><td>Land and transform data</td></tr>
<tr><td>Streaming ingest</td><td>Kinesis Data Streams, Amazon MSK, Amazon Data Firehose</td><td>Continuous ingestion</td></tr>
<tr><td>Processing</td><td>Amazon EMR (on EC2, on EKS, Serverless), Amazon Managed Service for Apache Flink</td><td>Large-scale Spark/Hive/Trino and stateful stream processing</td></tr>
<tr><td>Query &amp; warehouse</td><td>Amazon Athena, Amazon Redshift</td><td>Ad hoc SQL on S3; high-concurrency BI warehouse</td></tr>
<tr><td>BI / ML</td><td>Amazon QuickSight, Amazon SageMaker (unified studio) and Amazon SageMaker AI</td><td>Dashboards, ML on the governed data</td></tr>
</tbody></table>
<p>Glue features that show up in scenarios: <strong>job bookmarks</strong> for incremental processing, <strong>Glue Data Quality</strong> rules, Glue Schema Registry for streaming schemas, and Glue DataBrew for no-code preparation.</p>`
            },
            {
              heading: 'Governance and sharing with Lake Formation',
              html: `<ul>
<li><strong>Register</strong> S3 locations with Lake Formation; integrated engines (Athena, Redshift Spectrum, EMR, Glue) receive temporary, scoped credentials from Lake Formation instead of needing broad S3 permissions.</li>
<li><strong>Fine-grained access:</strong> column-level permissions, plus <strong>data filters</strong> for row-level and cell-level security.</li>
<li><strong>LF-Tags (tag-based access control):</strong> tag databases, tables and columns (for example <code>confidentiality=pii</code>, <code>domain=claims</code>) and grant on tag expressions – scales far better than granting on hundreds of named tables.</li>
<li><strong>Cross-account sharing:</strong> grant to another account, OU or the organization; Lake Formation uses AWS RAM under the hood. The consumer's data lake administrator re-grants to local principals and creates <strong>resource links</strong> so the shared tables appear in the local catalog.</li>
<li><strong>Data mesh pattern:</strong> producer accounts own data, a central governance account holds the catalog and permissions, consumer accounts query with their own compute.</li>
<li><strong>Hybrid access mode</strong> lets existing IAM/S3-policy access continue while you onboard tables to Lake Formation permissions gradually.</li>
</ul>
<div class="callout warn">Out of the box, the Data Catalog grants access through the <code>IAMAllowedPrincipals</code> group ("use only IAM access control"). Until you remove that default for a database or table, Lake Formation fine-grained permissions are not actually enforced.</div>`
            },
            {
              heading: 'Query and processing engines',
              html: `<table><thead><tr><th>Engine</th><th>Best for</th><th>Cost model</th></tr></thead><tbody>
<tr><td>Athena</td><td>Serverless, ad hoc SQL on S3; federated queries through Lambda connectors; Iceberg tables with ACID and time travel</td><td>Per data scanned, or provisioned capacity</td></tr>
<tr><td>AWS Glue ETL</td><td>Serverless Spark/Python ETL with catalog integration</td><td>Per DPU-hour</td></tr>
<tr><td>Amazon EMR</td><td>Large or custom Spark, Hive, Presto/Trino, HBase; full framework control</td><td>Instances (EC2/EKS) or per-use (Serverless)</td></tr>
<tr><td>Redshift</td><td>High-concurrency BI and complex joins on curated data</td><td>Nodes (provisioned) or RPU-hours (Serverless)</td></tr>
</tbody></table>
<ul>
<li><strong>Athena performance and cost:</strong> convert to columnar <strong>Parquet/ORC</strong> with compression, partition by common filters (for example date), use <strong>partition projection</strong> for highly partitioned tables, compact many small files, and set <strong>workgroup data usage controls</strong> to cancel runaway queries.</li>
<li><strong>EMR cost:</strong> transient clusters per job, S3 (EMRFS) as the durable store instead of HDFS, <strong>Spot for task nodes</strong>, instance fleets with diversified types; EMR Serverless removes cluster sizing.</li>
</ul>`
            },
            {
              heading: 'Amazon Redshift at scale',
              html: `<ul>
<li><strong>RA3 nodes</strong> separate compute from <strong>Redshift managed storage</strong>, so you scale compute without buying storage; <strong>Redshift Serverless</strong> removes node management entirely.</li>
<li><strong>Data sharing</strong> gives live, transactionally consistent read access to data in another cluster or workgroup – across accounts and Regions – <strong>without copying</strong>. Producers and consumers must be RA3 or Serverless; consumers pay for their own compute, which isolates workloads.</li>
<li><strong>Redshift Spectrum</strong> queries data in S3 through an external schema in the Glue Data Catalog, so cold history stays in the lake while hot data lives in the warehouse.</li>
<li><strong>Concurrency scaling</strong> adds transient capacity for bursts of queries; workload management prioritizes queues; materialized views precompute expensive joins.</li>
<li><strong>Zero-ETL integrations</strong> replicate data from sources such as Aurora MySQL, Aurora PostgreSQL, RDS for MySQL and DynamoDB (and some SaaS applications) into Redshift in near real time with no pipeline to build or operate.</li>
<li><strong>Streaming ingestion</strong> reads Kinesis Data Streams or MSK directly into materialized views.</li>
</ul>
<div class="callout">Copying data into each business unit's warehouse creates stale, inconsistent copies and storage cost. When the requirement says "live", "without copying" or "isolate compute per team", the answer is Redshift data sharing.</div>`
            },
            {
              heading: 'Streaming ingestion choices',
              html: `<table><thead><tr><th>Service</th><th>Strength</th><th>Choose when</th></tr></thead><tbody>
<tr><td>Kinesis Data Streams</td><td>Ordered per shard, multiple consumers, replay (retention extendable up to a year); on-demand or provisioned</td><td>You write custom consumers or need replay and fan-out</td></tr>
<tr><td>Amazon Data Firehose</td><td>Fully managed delivery to S3, Redshift, OpenSearch, Splunk, HTTP endpoints and Iceberg tables; buffering, Lambda transformation, Parquet/ORC conversion, dynamic partitioning</td><td>"Load streaming data into a destination with no code to manage"; near-real-time is acceptable</td></tr>
<tr><td>Amazon MSK (provisioned or Serverless)</td><td>Apache Kafka APIs and ecosystem; MSK Connect for connectors</td><td>Existing Kafka producers/consumers or Kafka-specific features</td></tr>
<tr><td>Managed Service for Apache Flink</td><td>Stateful processing, windows, joins, exactly-once state</td><td>Real-time aggregation, anomaly detection, enrichment</td></tr>
</tbody></table>
<p>Firehose was renamed from Kinesis Data Firehose to <strong>Amazon Data Firehose</strong>, and Kinesis Data Analytics is now <strong>Amazon Managed Service for Apache Flink</strong>; exam answers may use either name.</p>`
            },
            {
              heading: 'Reference scenario',
              html: `<p><strong>Scenario:</strong> an insurer has 12 business units, each with its own AWS account and data. The CDO wants one governed catalog, PII columns visible only to approved analysts, finance and actuarial teams querying the same warehouse tables without copies, and near-real-time policy data from Aurora in the warehouse.</p>
<ul>
<li>A central governance account runs Lake Formation with LF-Tags (<code>domain</code>, <code>confidentiality</code>); producer accounts register their S3 locations; grants on tag expressions are shared to consumer accounts, which create resource links.</li>
<li>Data filters hide PII columns and restrict rows by region for most analysts; Athena and EMR consumers use their own accounts' compute.</li>
<li>Clickstream arrives through Amazon Data Firehose, converted to Parquet and dynamically partitioned by date; claims events flow through MSK and Managed Service for Apache Flink into Iceberg tables.</li>
<li>A Redshift RA3 producer uses an Aurora zero-ETL integration for policy data and shares it with finance and actuarial Redshift Serverless consumers through data sharing; Spectrum covers seven years of history in S3.</li>
</ul>`
            }
          ],
          keyPoints: [
            `Lake Formation adds column, row and cell-level permissions and LF-Tag based grants on top of the Glue Data Catalog.`,
            `Cross-account lake sharing uses Lake Formation grants (via RAM) plus resource links in the consumer account.`,
            `Athena cost scales with data scanned: Parquet/ORC, compression, partitioning and workgroup limits.`,
            `Redshift RA3/Serverless enable data sharing: live, cross-account, no copies, separate consumer compute.`,
            `Zero-ETL integrations move Aurora, RDS for MySQL and DynamoDB data into Redshift without pipelines.`,
            `Data Firehose = managed delivery with transformation and format conversion; KDS = custom consumers and replay; MSK = Kafka.`
          ],
          examTips: [
            `If the requirement is column- or row-level access to S3 data across accounts, think Lake Formation (data filters, LF-Tags), not bucket policies.`,
            `If Athena queries are slow and expensive on CSV, think Parquet + partitioning (Glue ETL or CTAS).`,
            `If several teams need live access to the same warehouse data with isolated compute, think Redshift data sharing.`,
            `If streaming data must land in S3 as partitioned Parquet with no custom code, think Amazon Data Firehose.`,
            `If the source is Aurora and the target is Redshift with "no ETL pipeline to manage", think zero-ETL integration.`
          ],
          services: ['AWS Lake Formation', 'AWS Glue', 'Amazon Athena', 'Amazon EMR', 'Amazon Redshift', 'Amazon Kinesis Data Streams', 'Amazon Data Firehose', 'Amazon MSK', 'Amazon Managed Service for Apache Flink']
        },
        {
          id: 'p-resilience-engineering',
          title: 'Resilience Engineering: Route 53 ARC, Cell-Based Architecture, Shuffle Sharding & Static Stability',
          minutes: 18,
          summary: `Design systems whose recovery does not depend on the things that are failing, contain blast radius with cells and shuffle sharding, and prove it with Resilience Hub and FIS.`,
          sections: [
            {
              heading: 'Control planes, data planes and static stability',
              html: `<p>A <strong>control plane</strong> changes the system (launch an instance, update a DNS record, create a load balancer). A <strong>data plane</strong> delivers the service (a running instance serving requests, Route 53 answering queries). Data planes are simpler and far more available than control planes.</p>
<ul>
<li><strong>Static stability:</strong> the system keeps working through an impairment <em>without</em> control-plane actions – capacity already running in surviving AZs or Regions, credentials and configuration already in place.</li>
<li>Pre-provision capacity for the loss of one AZ (for example, size each of three AZs at 50% of peak) rather than relying on Auto Scaling during the event.</li>
<li>Avoid <strong>bimodal behavior</strong>: paths used only during failure (a cold cache, a never-tested fallback) tend to fail when needed. The <strong>constant work</strong> pattern does the same amount of work whether healthy or not.</li>
<li>Failover mechanisms should rely on data-plane operations: health checks, routing controls, Global Accelerator dials.</li>
</ul>`
            },
            {
              heading: 'Route 53 Application Recovery Controller',
              html: `<table><thead><tr><th>Capability</th><th>Scope</th><th>What it does</th><th>Design notes</th></tr></thead><tbody>
<tr><td>Zonal shift</td><td>AZ</td><td>Operator temporarily moves traffic away from one AZ for supported resources (for example ALB, NLB, EC2 Auto Scaling groups, EKS)</td><td>Has an expiry you set and can extend; remaining AZs need the capacity</td></tr>
<tr><td>Zonal autoshift</td><td>AZ</td><td>AWS shifts traffic away automatically when it detects an AZ impairment, and shifts it back afterward</td><td>Configure practice runs with outcome alarms to prove the remaining AZs can cope</td></tr>
<tr><td>Routing controls</td><td>Region or cell</td><td>On/off switches tied to Route 53 health checks, hosted on a cluster of five Regional endpoints</td><td>Safety rules: <strong>assertion rules</strong> (for example at least one Region On) and <strong>gating rules</strong> (a master switch)</td></tr>
<tr><td>Region switch</td><td>Region</td><td>Executes a pre-authored plan of failover steps (for example Aurora Global Database failover, scaling the standby, routing changes) from the healthy Region</td><td>Plans must be authored, kept current and rehearsed</td></tr>
</tbody></table>
<div class="callout">Change routing control states through the cluster's data-plane endpoints and retry across them; never make your Region evacuation depend on console access or a control plane in the impaired Region.</div>`
            },
            {
              heading: 'Cells and shuffle sharding',
              html: `<p><strong>Cell-based architecture</strong> runs many complete, independent copies (cells) of a workload, each serving a subset of customers selected by a partition key such as customer ID. A thin, highly available <strong>cell router</strong> maps customers to cells.</p>
<ul>
<li>A failure, bad deployment or poison request affects only one cell's customers; deploy changes <strong>cell by cell</strong> in waves.</li>
<li>Cap each cell at a size you have load-tested; grow by adding cells, not by enlarging them.</li>
<li>Keep the router as simple as possible (for example a lookup table in DynamoDB or DNS), because it is shared by everything.</li>
</ul>
<p><strong>Shuffle sharding</strong> assigns each customer a random combination of workers. With 8 workers and shards of 2, there are 28 unique combinations, so a customer whose requests crash workers takes down only its own pair, and most other customers share at most one worker with it and can retry on the other.</p>
<table><thead><tr><th>Approach</th><th>Blast radius of one bad customer</th></tr></thead><tbody>
<tr><td>Shared fleet</td><td>Everyone</td></tr>
<tr><td>Simple sharding (fixed groups)</td><td>Everyone in that shard</td></tr>
<tr><td>Shuffle sharding</td><td>Only customers with the identical combination; others degrade partially at most</td></tr>
<tr><td>Cells</td><td>One cell's customers, including shared databases and dependencies inside the cell</td></tr>
</tbody></table>`
            },
            {
              heading: 'Failure-handling patterns',
              html: `<ul>
<li><strong>Timeouts everywhere</strong>, set below the caller's own timeout.</li>
<li><strong>Retries with capped exponential backoff and jitter</strong> spread retries out so clients do not synchronize into waves; AWS SDK standard and adaptive retry modes implement this.</li>
<li><strong>Retry at one layer</strong> only: retries at every layer multiply (three layers of three retries = 27 attempts on the bottom dependency).</li>
<li><strong>Retry budgets / token buckets</strong> and <strong>circuit breakers</strong> stop retrying a dependency that is clearly down.</li>
<li><strong>Load shedding</strong> rejects excess work early (HTTP 429/503) so the requests you accept still succeed; API Gateway throttling and SQS buffering are common tools.</li>
<li><strong>Idempotency tokens</strong> make retries safe; <strong>bulkheads</strong> separate thread pools or connection pools per dependency.</li>
</ul>`
            },
            {
              heading: 'Proving resilience: Resilience Hub and FIS',
              html: `<ul>
<li><strong>AWS Resilience Hub</strong>: define a resiliency policy with RTO/RPO per disruption type (application, infrastructure, AZ, Region), import the app from CloudFormation, Terraform state, EKS, AppRegistry or resource groups, and get assessments, recommendations, suggested alarms, SOPs and FIS experiments. Run assessments in CI/CD to catch resilience drift.</li>
<li><strong>AWS FIS</strong>: experiment templates with actions, targets and CloudWatch-alarm stop conditions; the <strong>scenario library</strong> includes AZ power interruption and cross-Region connectivity disruption; multi-account experiments run from a central account; a safety lever can halt experiments in an account.</li>
<li>Run game days: rehearse zonal shifts and Region switch plans regularly, not only when something breaks.</li>
</ul>`
            },
            {
              heading: 'Reference scenario',
              html: `<p><strong>Scenario:</strong> a multi-tenant payments API had two incidents: one tenant's malformed batch crashed every worker, and a bad deployment took down all customers at once. An AZ impairment also degraded latency for 40 minutes.</p>
<ul>
<li>Split the platform into cells (each with its own ECS services and DynamoDB tables), with a thin router reading a tenant-to-cell mapping table; deployments roll out one cell at a time with alarms gating each wave.</li>
<li>Inside each cell, shuffle-shard tenants across worker groups so a poison tenant affects only its own combination.</li>
<li>Run each AZ at enough capacity to lose one AZ (static stability) and enable zonal autoshift on the load balancers; use ARC routing controls with an assertion rule to evacuate a Region.</li>
<li>Capped exponential backoff with jitter in clients, retries only at the edge, circuit breakers to the card network; Resilience Hub assessments in the pipeline and quarterly FIS AZ power interruption game days.</li>
</ul>`
            }
          ],
          keyPoints: [
            `Static stability: survive impairments using pre-provisioned capacity and data-plane mechanisms only.`,
            `Zonal shift (manual) and zonal autoshift (AWS-initiated) move traffic away from an impaired AZ.`,
            `ARC routing controls with assertion and gating safety rules give a reliable, operator-driven Region switch.`,
            `Cells contain blast radius per customer subset; deploy cell by cell behind a thin router.`,
            `Shuffle sharding gives each customer a unique combination of workers, isolating poison tenants.`,
            `Use timeouts, capped exponential backoff with jitter, retry at one layer, circuit breakers and load shedding.`
          ],
          examTips: [
            `If one tenant's bad requests take down all tenants, think shuffle sharding or cells.`,
            `If a bad deployment must affect only a small fraction of customers, think cell-based architecture with wave deployments.`,
            `If retries amplify an outage, think exponential backoff with jitter, retry budgets and circuit breakers – not more retries.`,
            `If a multi-step cross-Region failover (database, scaling, routing) must be orchestrated and rehearsed, think ARC Region switch.`,
            `If capacity is added only after a failure is detected, the design is not statically stable.`
          ],
          services: ['Amazon Route 53 Application Recovery Controller', 'AWS Resilience Hub', 'AWS Fault Injection Service', 'Elastic Load Balancing', 'Amazon EC2 Auto Scaling', 'Amazon DynamoDB']
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
        },
        {
          id: 'p-operations-at-scale',
          title: 'Operations at Organization Scale: Cross-Account Observability, Central Logging, Config & Systems Manager',
          minutes: 18,
          summary: `Run hundreds of accounts like one estate: a monitoring account per Region, a tamper-resistant log archive, organization-wide compliance views, and fleet operations through Systems Manager.`,
          sections: [
            {
              heading: 'Centralized observability',
              html: `<ul>
<li><strong>CloudWatch cross-account observability</strong> (Observability Access Manager): create a <strong>sink</strong> in a monitoring account and <strong>links</strong> from source accounts. The monitoring account can then search logs, view metrics and alarms, and follow X-Ray traces and Application Signals across accounts without copying data.</li>
<li>It is configured <strong>per Region</strong>; onboard every account (including future ones) through an Organizations-wide setup or a service-managed StackSet.</li>
<li>Cross-account, cross-Region <strong>dashboards</strong> combine widgets from many accounts; Amazon Managed Grafana can query CloudWatch, Prometheus and other sources across accounts.</li>
<li><strong>AWS Health organizational view</strong> aggregates Health events for all accounts, and EventBridge rules can route them to the right teams.</li>
</ul>`
            },
            {
              heading: 'Centralized logging into a Log Archive account',
              html: `<table><thead><tr><th>Log source</th><th>Delivery pattern</th><th>Destination</th></tr></thead><tbody>
<tr><td>CloudTrail</td><td>Organization trail</td><td>Log Archive S3 bucket (optionally also a CloudTrail Lake event data store)</td></tr>
<tr><td>AWS Config</td><td>Delivery channel in every account/Region</td><td>Log Archive bucket; aggregator in the security or audit account</td></tr>
<tr><td>VPC Flow Logs</td><td>Publish directly to a central bucket (cross-account bucket policy)</td><td>Log Archive bucket</td></tr>
<tr><td>Application logs in CloudWatch Logs</td><td>Subscription filters or account-level subscription filter policies to a <strong>cross-account destination</strong> (Kinesis Data Streams or Amazon Data Firehose), or the newer CloudWatch Logs centralization rules</td><td>Firehose to the Log Archive bucket and/or OpenSearch</td></tr>
<tr><td>ALB, CloudFront, WAF logs</td><td>Native delivery (WAF can also use Firehose)</td><td>Log Archive bucket</td></tr>
<tr><td>Security telemetry</td><td>Amazon Security Lake</td><td>OCSF-normalized data lake for SIEM subscribers</td></tr>
</tbody></table>
<ul>
<li>Protect the archive: S3 Object Lock (compliance mode for strict WORM), SSE-KMS with a key policy limited to log writers and readers, a bucket policy using <code>aws:SourceOrgID</code> for service deliveries, and SCPs denying changes to trails, Config and the bucket.</li>
<li>Lifecycle older logs to Glacier storage classes; query with Athena using partition projection.</li>
</ul>
<div class="callout warn">CloudWatch Logs export tasks are batch, one-at-a-time jobs – fine for occasional archiving, wrong for "near-real-time centralization from hundreds of accounts". Use subscriptions to a cross-account destination.</div>`
            },
            {
              heading: 'Auditing at scale: CloudTrail Lake and Config aggregators',
              html: `<ul>
<li><strong>CloudTrail Lake</strong> stores events in <strong>event data stores</strong> (organization-wide when created from the management or delegated admin account) and lets investigators run SQL directly, with multi-year retention options. It can also ingest Config configuration items and events from outside AWS. Compared with Athena over trail files in S3 it needs no table or partition management, at a higher price. Check current availability and pricing before standardizing on it for a new design.</li>
<li><strong>AWS Config aggregators</strong>: an <strong>organization aggregator</strong> in the management or a delegated admin account gives a read-only, multi-account, multi-Region view of resource inventory and rule compliance. <strong>Advanced queries</strong> run SQL-like queries over current configuration across the aggregator.</li>
<li>Deploy rules everywhere with <strong>organization Config rules</strong> and <strong>organization conformance packs</strong>; attach <strong>remediation</strong> through Systems Manager Automation documents.</li>
<li>Config detects; it does not prevent. Pair it with SCPs/RCPs and CloudFormation Hooks for prevention.</li>
</ul>`
            },
            {
              heading: 'Systems Manager across the organization',
              html: `<table><thead><tr><th>Capability</th><th>Purpose</th><th>How it scales</th></tr></thead><tbody>
<tr><td>Quick Setup</td><td>Configure Systems Manager features with recommended defaults</td><td>Targets the organization, OUs and Regions from the management or delegated admin account</td></tr>
<tr><td>Default Host Management Configuration</td><td>Makes EC2 instances managed without attaching an instance profile to each</td><td>Account/Region setting, deployable via Quick Setup</td></tr>
<tr><td>State Manager</td><td>Keeps instances in a desired state (agents installed, configuration applied) on a schedule</td><td>Associations target tags or resource groups, so new instances are covered automatically</td></tr>
<tr><td>Patch Manager</td><td>Patch baselines, scanning and installation, compliance reporting</td><td><strong>Patch policies</strong> through Quick Setup across accounts and Regions; maintenance windows for timing</td></tr>
<tr><td>Automation</td><td>Runbooks for remediation and routine operations</td><td><strong>Multi-account, multi-Region execution</strong> using an administration role in the central account and execution roles in targets, with concurrency and error thresholds</td></tr>
<tr><td>Inventory + Resource Data Sync</td><td>Software and configuration inventory</td><td>Sync from all accounts to a central S3 bucket; query with Athena</td></tr>
<tr><td>Explorer and OpsCenter</td><td>Aggregated operational data and OpsItems (issues to investigate)</td><td>Multi-account view via delegated admin / resource data sync</td></tr>
<tr><td>Incident Manager</td><td>Response plans, escalation and engagement, runbooks</td><td>High-level knowledge is enough for the exam</td></tr>
</tbody></table>
<div class="callout">AWS has been consolidating Systems Manager into a unified, organization-aware console and has changed the availability of some older capabilities for new customers. The patterns above – desired state, patch policies, multi-account Automation – are what the exam tests.</div>`
            },
            {
              heading: 'Reference scenario',
              html: `<p><strong>Scenario:</strong> a company with 250 accounts in six Regions has inconsistent patching, logs scattered across accounts, and auditors asking "who changed this security group three years ago?".</p>
<ul>
<li>A monitoring account per Region with OAM links to every account, created through a service-managed StackSet so new accounts are linked automatically.</li>
<li>Account-level subscription filter policies send application logs to Firehose destinations in the Log Archive account, landing in an Object Lock bucket; the organization trail and Config deliver there too.</li>
<li>A CloudTrail Lake organization event data store in the security account answers historical SQL questions; an organization Config aggregator with advanced queries shows current compliance.</li>
<li>Quick Setup patch policies apply baselines in every account and Region; State Manager keeps the CloudWatch agent configured; an operations account runs multi-account Automation runbooks with rate controls for remediation.</li>
</ul>`
            }
          ],
          keyPoints: [
            `CloudWatch cross-account observability uses a sink in the monitoring account and links from source accounts, per Region.`,
            `Centralize CloudWatch Logs with subscriptions to cross-account destinations (Firehose/KDS), not export tasks.`,
            `CloudTrail Lake = SQL over CloudTrail events with long retention and no table management.`,
            `Config organization aggregators give a read-only multi-account compliance view; advanced queries add SQL.`,
            `State Manager enforces desired state continuously; Patch Manager patch policies cover the org via Quick Setup.`,
            `Automation runs multi-account, multi-Region with administration and execution roles plus rate controls.`
          ],
          examTips: [
            `If many accounts need one place to view metrics, logs and traces "without copying data", think cross-account observability.`,
            `If logs from all accounts must reach a central bucket in near real time, think subscription filters to a cross-account Firehose destination.`,
            `If investigators need SQL over years of API activity with minimal setup, think CloudTrail Lake.`,
            `If the requirement is "ensure an agent stays installed on all current and future instances", think State Manager association, not user data or a one-time Run Command.`,
            `If the question needs one runbook executed in every account and Region with controlled rollout, think multi-account Automation.`
          ],
          services: ['Amazon CloudWatch', 'AWS CloudTrail Lake', 'AWS Config', 'AWS Systems Manager', 'Amazon Data Firehose', 'AWS Health', 'Amazon Security Lake']
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
<li><strong>AWS Migration Hub</strong>: single place to track migration status across tools, with network visualization of discovered dependencies and EC2 instance recommendations. AWS Migration Hub (including Refactor Spaces) closed to new customers on November 7, 2025; existing customers can keep using it, and AWS points new projects to AWS Transform. The current SAP-C02 exam was written before this change, so expect Migration Hub in questions.</li>
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
<tr><td>Web app with spiky traffic</td><td>Lambda + API Gateway, or ECS on Fargate</td><td>Consider Lambda limits (15-minute max duration)</td></tr>
<tr><td>Self-managed message broker</td><td>Amazon MQ (ActiveMQ/RabbitMQ protocol compatibility) or SQS/SNS when redesigning</td><td>Amazon MQ avoids rewriting clients</td></tr>
</tbody></table>`
            },
            {
              heading: 'Database modernization',
              html: `<ul>
<li>Commercial engines to <strong>Aurora PostgreSQL/MySQL</strong> to remove licensing costs (SCT/DMS Schema Conversion + DMS). <strong>Babelfish for Aurora PostgreSQL</strong> understands T-SQL and the SQL Server wire protocol, reducing application changes for SQL Server migrations.</li>
<li>Keep Oracle or SQL Server on <strong>RDS</strong> (replatform) when the app depends on proprietary features; <strong>RDS Custom</strong> when you need OS or database customization access.</li>
<li>Purpose-built: DynamoDB for key-value at scale, DocumentDB for MongoDB-compatible workloads, ElastiCache/MemoryDB for in-memory, Neptune for graph, Timestream for InfluxDB for time series (Timestream for LiveAnalytics is closed to new customers), OpenSearch for search, Redshift for warehousing.</li>
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
        },
        {
          id: 'p-modernization-patterns',
          title: 'Modernization Patterns: Decomposing Monoliths, Event-Driven Redesign & Database Modernization',
          minutes: 18,
          summary: `Apply proven decomposition patterns on AWS: a routing façade, event interception and CDC, sagas and outboxes, fan-out messaging, and like-for-like or engine-changing database moves.`,
          sections: [
            {
              heading: 'Decomposition patterns',
              html: `<table><thead><tr><th>Pattern</th><th>How it works</th><th>Use when</th></tr></thead><tbody>
<tr><td>Strangler fig</td><td>A façade routes selected paths to new services; the monolith shrinks over time</td><td>HTTP-facing capabilities can be carved out one at a time</td></tr>
<tr><td>Branch by abstraction</td><td>Introduce an interface inside the code, build the new implementation behind it, switch over</td><td>The component is internal and not reachable at the edge</td></tr>
<tr><td>Event interception / leave-and-layer</td><td>Capture the monolith's changes (CDC from its database, or events it publishes) and build new features on that stream</td><td>Add capability without changing monolith code</td></tr>
<tr><td>Parallel run</td><td>Old and new both process requests; outputs are compared before switching</td><td>High-risk logic such as pricing or billing</td></tr>
<tr><td>Anti-corruption layer</td><td>Translates between legacy and new domain models</td><td>Keep the new service's model clean</td></tr>
</tbody></table>
<ul>
<li>Draw boundaries around <strong>business capabilities / bounded contexts</strong>, starting with something valuable but loosely coupled.</li>
<li>Split the <strong>data</strong>, not just the code: a microservice that still writes the monolith's tables is a distributed monolith.</li>
</ul>`
            },
            {
              heading: 'Building the façade on AWS',
              html: `<ul>
<li><strong>Amazon API Gateway:</strong> REST APIs (usage plans and API keys, request validation, caching, private APIs, WAF) or HTTP APIs (lower cost and latency, JWT authorizers). Route <code>/orders</code> to Lambda and keep a default route to the monolith through a <strong>VPC link</strong>, so the monolith stays on a private, internal load balancer.</li>
<li><strong>ALB listener rules</strong> (path or header based, with Lambda or IP targets) or <strong>CloudFront behaviors</strong> are alternative façades.</li>
<li><strong>AWS Migration Hub Refactor Spaces</strong> automated this pattern across accounts (API Gateway, NLB and Transit Gateway). AWS has announced it is no longer open to new customers, so for new projects build the same façade directly with API Gateway or ALB plus Transit Gateway or VPC Lattice.</li>
<li><strong>Lambda behind the façade:</strong> mind the 15-minute maximum duration, concurrency limits and database connections (RDS Proxy); use ECS on Fargate for long-running or steady-load services.</li>
</ul>
<div class="callout">Weighted DNS splits traffic randomly, not by capability. A strangler façade needs <strong>path or header routing</strong> so that each capability goes to exactly one implementation.</div>`
            },
            {
              heading: 'Event-driven redesign',
              html: `<table><thead><tr><th>Fan-out option</th><th>Strength</th><th>Pick when</th></tr></thead><tbody>
<tr><td>SNS topic → SQS queues</td><td>Durable buffering per subscriber, subscription <strong>filter policies</strong> on attributes or payload, DLQs, FIFO topics for ordered fan-out</td><td>A few to many consumers, each processing at its own pace</td></tr>
<tr><td>EventBridge bus</td><td>Content-based rules, many targets, cross-account buses, SaaS sources, schema registry, archive and replay</td><td>Routing domain events across teams and accounts</td></tr>
<tr><td>Kinesis Data Streams / MSK</td><td>Ordered, replayable log; many independent readers</td><td>High-volume streams and replay requirements</td></tr>
</tbody></table>
<ul>
<li><strong>Transactional outbox:</strong> write the state change and the event in the same database transaction (for example to an outbox table or a DynamoDB item whose stream feeds EventBridge), so an event is never lost or published for a rolled-back change.</li>
<li><strong>Sagas</strong> replace distributed transactions: Step Functions orchestrates the steps and runs <strong>compensating actions</strong> (refund, release inventory) when a later step fails.</li>
<li>Consumers must be <strong>idempotent</strong> because SNS, SQS and EventBridge deliver at least once.</li>
<li><strong>CDC to a stream:</strong> AWS DMS can replicate ongoing changes from the monolith database to Kinesis Data Streams (or MSK), letting new services build their own read models without touching monolith code.</li>
</ul>`
            },
            {
              heading: 'Database modernization',
              html: `<table><thead><tr><th>Goal</th><th>Tooling</th></tr></thead><tbody>
<tr><td>Like-for-like move (MySQL → RDS/Aurora MySQL, PostgreSQL → RDS/Aurora PostgreSQL, MongoDB → DocumentDB)</td><td><strong>DMS homogeneous data migrations</strong>: a managed, serverless experience that uses the engine's native tools for full load and ongoing replication</td></tr>
<tr><td>Leave SQL Server with minimal code change</td><td><strong>Babelfish for Aurora PostgreSQL</strong>: a T-SQL / TDS endpoint (SQL Server port 1433) alongside the PostgreSQL endpoint; assess first with <strong>Babelfish Compass</strong></td></tr>
<tr><td>Change engine and convert code (Oracle → Aurora PostgreSQL)</td><td>DMS Schema Conversion (with generative AI assistance for some conversions) or AWS SCT, then DMS full load + CDC</td></tr>
<tr><td>Break out purpose-built stores</td><td>DynamoDB for carts and sessions, OpenSearch for search, ElastiCache for hot reads, fed by CDC or events</td></tr>
</tbody></table>
<div class="callout warn">Babelfish does not support every T-SQL feature. Run Babelfish Compass against the schema and plan remediation for unsupported items before promising "no code changes".</div>`
            },
            {
              heading: 'Reference scenario',
              html: `<p><strong>Scenario:</strong> a travel company's .NET booking monolith on EC2 uses SQL Server; search is slow, every release is monthly, and the business wants a new loyalty feature next quarter without touching the booking core.</p>
<ul>
<li>An API Gateway HTTP API becomes the single entry point; the default route reaches the monolith on an internal ALB through a VPC link, and <code>/search</code> moves to a new service.</li>
<li>DMS CDC streams booking changes into Kinesis Data Streams; the search service builds an OpenSearch index and the loyalty service builds its own DynamoDB tables from the stream (event interception).</li>
<li>Booking becomes a Step Functions saga (reserve seat, take payment, issue ticket) with compensations; confirmation events fan out through SNS to SQS queues for email, loyalty and analytics with filter policies.</li>
<li>SQL Server moves to Aurora PostgreSQL with Babelfish after a Compass assessment; a separate MySQL reporting database moves with DMS homogeneous data migrations.</li>
</ul>`
            }
          ],
          keyPoints: [
            `Strangler fig, branch by abstraction, event interception, parallel run and anti-corruption layers are complementary.`,
            `Façade on AWS: API Gateway (VPC link to a private monolith), ALB rules or CloudFront behaviors – path-based, not weighted DNS.`,
            `Refactor Spaces is closed to new customers; build the façade directly.`,
            `SNS → SQS fan-out with filter policies gives each consumer its own durable buffer.`,
            `Use sagas with compensations and the transactional outbox instead of distributed transactions.`,
            `DMS homogeneous migrations for like-for-like moves; Babelfish (assessed with Compass) for SQL Server to Aurora PostgreSQL.`
          ],
          examTips: [
            `If new services need monolith data in near real time "without changing the monolith", think DMS CDC to Kinesis (event interception).`,
            `If a business transaction now spans several services, think Step Functions saga with compensating actions.`,
            `If several consumers each need every order event but only some event types, think SNS fan-out to SQS with filter policies.`,
            `If the migration is PostgreSQL to Aurora PostgreSQL with minimal effort, think DMS homogeneous data migrations, not SCT.`,
            `If the monolith must stay private while new routes go to Lambda, think API Gateway with a VPC link.`
          ],
          services: ['Amazon API Gateway', 'AWS Lambda', 'Amazon SNS', 'Amazon SQS', 'Amazon EventBridge', 'AWS Step Functions', 'AWS Database Migration Service', 'Babelfish for Aurora PostgreSQL']
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
,
    // org – identity federation and hybrid edge
    { domain: 'org', front: `Cognito user pool vs identity pool`, back: `<b>User pool</b>: user directory and authentication, issues JWTs. <b>Identity pool</b>: exchanges tokens (or guest access) for <b>temporary AWS credentials</b> via an IAM role.` },
    { domain: 'org', front: `Core ABAC condition for matching projects`, back: `<b>aws:ResourceTag/project</b> must equal <b>aws:PrincipalTag/project</b>; also require aws:RequestTag on create and deny tag changes.` },
    { domain: 'org', front: `How do Identity Center users get session tags for ABAC?`, back: `<b>Attributes for access control</b>, mapped from SAML assertion or SCIM attributes of the external IdP.` },
    { domain: 'org', front: `Why does a permission set fail to provision with a customer managed policy?`, back: `Customer managed policies are referenced <b>by name and path</b>; the policy must already exist in every target account (deploy it with StackSets).` },
    { domain: 'org', front: `Letting developers create IAM roles safely`, back: `Allow iam:CreateRole only when <b>iam:PermissionsBoundary</b> equals the approved boundary ARN; deny removing/altering the boundary; restrict role path and iam:PassRole.` },
    { domain: 'org', front: `Maximum session duration for a chained role`, back: `<b>One hour</b>, regardless of the role's configured maximum.` },
    { domain: 'org', front: `IAM Roles Anywhere`, back: `Temporary AWS credentials for workloads <b>outside AWS</b> using X.509 certificates from a trusted CA – no long-term access keys.` },
    { domain: 'org', front: `What happens to an Outpost when the service link goes down?`, back: `Running instances and local traffic continue, but <b>no control-plane actions</b> (launch, modify) are possible – pre-provision spare capacity.` },
    { domain: 'org', front: `Outposts vs Local Zones vs Wavelength`, back: `<b>Outposts</b>: in your data center. <b>Local Zones</b>: AWS-run metro locations near users. <b>Wavelength</b>: inside 5G carrier networks for mobile devices.` },
    { domain: 'org', front: `Volume Gateway cached vs stored`, back: `<b>Cached</b>: primary data in AWS, hot data cached locally. <b>Stored</b>: full dataset on premises, asynchronous snapshots to AWS.` },
    { domain: 'org', front: `Replace a physical tape library without changing backup software`, back: `<b>Tape Gateway</b> (iSCSI VTL), archiving tapes to S3 Glacier Flexible Retrieval or Deep Archive.` },
    { domain: 'org', front: `AWS Cloud WAN`, back: `Global core network defined by one <b>network policy</b> with <b>segments</b>; automates multi-Region routing that would otherwise need TGW peering and static routes.` },
    // new – data analytics and resilience engineering
    { domain: 'new', front: `Lake Formation row- and cell-level security`, back: `<b>Data filters</b> (row filter expressions plus column inclusion/exclusion) granted to principals.` },
    { domain: 'new', front: `LF-Tags`, back: `Lake Formation <b>tag-based access control</b>: tag databases, tables and columns, then grant on tag expressions instead of named resources.` },
    { domain: 'new', front: `Consumer-side step for a Lake Formation cross-account share`, back: `The consumer's data lake admin <b>re-grants</b> to local principals and creates <b>resource links</b> to the shared database/table.` },
    { domain: 'new', front: `Why are Lake Formation permissions not enforced on a table?`, back: `The default <b>IAMAllowedPrincipals</b> grant ("use only IAM access control") is still in place; revoke it to enforce Lake Formation permissions.` },
    { domain: 'new', front: `Three Athena cost/performance levers`, back: `<b>Columnar formats</b> (Parquet/ORC) with compression, <b>partitioning</b> (with partition projection), and <b>workgroup data usage limits</b>.` },
    { domain: 'new', front: `Redshift data sharing requirements`, back: `<b>RA3</b> provisioned clusters or <b>Redshift Serverless</b> on both sides; live, no-copy reads across clusters, accounts and Regions.` },
    { domain: 'new', front: `Zero-ETL integration`, back: `Managed near-real-time replication from sources such as <b>Aurora, RDS for MySQL and DynamoDB into Redshift</b> with no pipeline to build.` },
    { domain: 'new', front: `Amazon Data Firehose key features`, back: `Managed delivery to S3, Redshift, OpenSearch, Splunk, HTTP and Iceberg; <b>buffering, Lambda transform, Parquet/ORC conversion, dynamic partitioning</b>.` },
    { domain: 'new', front: `Shuffle sharding`, back: `Assign each customer a <b>random combination</b> of workers so one bad customer only takes down its own combination; others overlap at most partially.` },
    { domain: 'new', front: `Cell-based architecture`, back: `Many independent copies of the full stack, each serving a subset of customers via a <b>thin cell router</b>; deploy cell by cell to limit blast radius.` },
    { domain: 'new', front: `Zonal shift vs zonal autoshift`, back: `<b>Zonal shift</b>: you move traffic away from an AZ temporarily. <b>Zonal autoshift</b>: AWS does it automatically when it detects an AZ impairment.` },
    { domain: 'new', front: `ARC safety rules`, back: `<b>Assertion rules</b> (e.g., at least one routing control On) and <b>gating rules</b> (a master switch that must be On before others change).` },
    { domain: 'new', front: `Why add jitter to exponential backoff?`, back: `To <b>desynchronize</b> retrying clients so they do not hit a recovering dependency in coordinated waves.` },
    // improve – operations at scale
    { domain: 'improve', front: `CloudWatch cross-account observability components`, back: `A <b>sink</b> in the monitoring account and <b>links</b> from source accounts (Observability Access Manager), configured per Region.` },
    { domain: 'improve', front: `Near-real-time CloudWatch Logs centralization across accounts`, back: `<b>Subscription filters</b> (or account-level subscription policies) to a <b>cross-account destination</b> such as Firehose, delivering to the Log Archive bucket.` },
    { domain: 'improve', front: `CloudTrail Lake`, back: `Managed <b>event data stores</b> with <b>SQL queries</b> over CloudTrail (and other) events, organization-wide, with long retention and no table management.` },
    { domain: 'improve', front: `Config organization aggregator`, back: `Read-only <b>multi-account, multi-Region</b> view of inventory and compliance from the management or delegated admin account; supports advanced queries.` },
    { domain: 'improve', front: `State Manager vs Run Command`, back: `<b>State Manager</b> continuously enforces a desired state (including new instances); <b>Run Command</b> runs a one-time command.` },
    { domain: 'improve', front: `Roles for multi-account Systems Manager Automation`, back: `<b>AutomationAdministrationRole</b> in the central account and <b>AutomationExecutionRole</b> in each target account.` },
    // migrate – modernization patterns
    { domain: 'migrate', front: `Transactional outbox pattern`, back: `Write the state change and the event in the <b>same transaction</b>, then publish from the outbox (e.g., via streams or CDC) so events are never lost or phantom.` },
    { domain: 'migrate', front: `Event interception for monolith decomposition on AWS`, back: `<b>DMS CDC</b> from the monolith database to <b>Kinesis Data Streams</b>; new services build their own data from the stream without changing monolith code.` },
    { domain: 'migrate', front: `DMS homogeneous data migrations`, back: `Managed, serverless like-for-like migrations (MySQL, PostgreSQL, MongoDB to DocumentDB) using the engine's <b>native tools</b>.` },
    { domain: 'migrate', front: `Status of Migration Hub Refactor Spaces`, back: `<b>No longer open to new customers</b>; build the strangler façade directly with API Gateway or ALB plus Transit Gateway or VPC Lattice.` }
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
    },
    // ---------------- org (expanded) ----------------
    {
      id: 'sap-051', domain: 'org', lesson: 'p-identity-federation', multi: false,
      question: `A company with 120 accounts wants application teams to create their own IAM roles for AWS Lambda functions and Amazon ECS tasks without opening tickets with the central cloud team. The security team is concerned that a developer could create a role with AdministratorAccess and then assume it or pass it to a function to escalate privileges. The developers' permission set already allows iam:CreateRole, iam:AttachRolePolicy and iam:PassRole. What should the solutions architect do to allow self-service while preventing privilege escalation?`,
      options: [
        `Attach an SCP to the workload OUs that denies iam:CreateRole for all principals except the central cloud team's role.`,
        `Create a permissions boundary policy that defines the maximum allowed permissions, update the developer permission set so that iam:CreateRole and iam:PutRolePermissionsBoundary are allowed only when the iam:PermissionsBoundary condition equals that policy ARN, deny deleting or modifying the boundary, and limit iam:PassRole to roles under a dedicated path.`,
        `Deploy an AWS Config rule that detects IAM roles with the AdministratorAccess policy attached and an automatic remediation that deletes them.`,
        `Replace the developer permission set with the AWS managed PowerUserAccess policy.`
      ],
      answer: [1],
      explanation: `<b>B is correct.</b> Requiring a specific permissions boundary on every role the developers create caps the effective permissions of those roles, and denying changes to the boundary plus restricting PassRole by path closes the escalation paths while keeping self-service.<br><b>A</b> prevents escalation but removes self-service entirely, which is the opposite of the requirement.<br><b>C</b> is detective: the privileged role exists until remediation runs, and any policy other than AdministratorAccess that grants broad rights is missed.<br><b>D</b> PowerUserAccess denies most IAM actions, so developers could no longer create roles at all.`
    },
    {
      id: 'sap-052', domain: 'org', lesson: 'p-identity-federation', multi: true,
      question: `A consumer fintech is building a mobile app. Customers must be able to sign up with email and password or sign in with Apple or Google, with MFA support. After sign-in, the app uploads identity documents directly to an Amazon S3 bucket, and each customer must be able to write only to an S3 prefix that belongs to them. The company does not want to proxy uploads through its own servers or embed long-term credentials in the app. Which combination of steps meets these requirements? (Choose TWO.)`,
      options: [
        `Create an Amazon Cognito user pool with Apple and Google configured as social identity providers and MFA enabled.`,
        `Create an IAM user for each customer during sign-up and return access keys to the app.`,
        `Create an Amazon Cognito identity pool that trusts the user pool, with an authenticated IAM role whose policy allows s3:PutObject only on the prefix built from the &#36;{cognito-identity.amazonaws.com:sub} policy variable.`,
        `Configure IAM Identity Center with Google Workspace as the identity source and assign customers a permission set.`,
        `Store a single IAM access key in AWS Secrets Manager and have the app retrieve it at startup to upload documents.`
      ],
      answer: [0, 2],
      explanation: `<b>A and C are correct.</b> The user pool provides sign-up, sign-in, social federation and MFA; the identity pool exchanges the user pool token for temporary credentials of an IAM role, and the policy variable scopes each customer to their own prefix, so the app uploads directly to S3 safely.<br><b>B</b> creates unmanageable numbers of IAM users and long-term keys on devices.<br><b>D</b> Identity Center is for workforce access to AWS accounts and applications, not millions of consumers.<br><b>E</b> distributes one shared long-term credential to every device; per-user isolation is impossible and a leaked key exposes everything.`
    },
    {
      id: 'sap-053', domain: 'org', lesson: 'p-identity-federation', multi: false,
      question: `A company uses IAM Identity Center with Microsoft Entra ID as the identity source. The platform team created a permission set that references a customer managed policy named DataReadOnly and assigned it to a group across 60 accounts. Provisioning succeeds in 12 accounts and fails in the other 48 with an error that the policy cannot be found. The team wants a consistent fix that also works for accounts created in the future. What should the solutions architect do?`,
      options: [
        `Convert the customer managed policy to an inline policy in each of the 48 accounts.`,
        `Re-create the permission set from the delegated administrator account instead of the management account.`,
        `Deploy the DataReadOnly policy with the same name and path to all accounts with a service-managed CloudFormation StackSet with automatic deployment, then re-provision the permission set.`,
        `Enable SCIM provisioning in Entra ID so that the policy is synchronized together with users and groups.`
      ],
      answer: [2],
      explanation: `<b>C is correct.</b> Permission sets reference customer managed policies by name and path, and the policy must already exist in each target account. A service-managed StackSet with automatic deployment creates it everywhere, including future accounts.<br><b>A</b> is a manual, per-account workaround that does not cover new accounts and bypasses the permission set design.<br><b>B</b> where the permission set is administered from does not change the requirement that the policy exist in each account.<br><b>D</b> SCIM synchronizes users and groups only; it never creates IAM policies.`
    },
    {
      id: 'sap-054', domain: 'org', lesson: 'p-identity-federation', multi: false,
      question: `A research company has 45 project teams sharing three AWS accounts. Each team must manage only the EC2 instances, S3 buckets and Secrets Manager secrets that belong to its project. New projects start every month, and the security team wants to stop creating a new IAM role and policy for each project. Users sign in through IAM Identity Center, and the corporate IdP already has a project attribute for every user. What should the solutions architect recommend?`,
      options: [
        `Map the IdP project attribute to a session tag with Identity Center attributes for access control, and use one permission set whose policies allow actions only when aws:ResourceTag/project equals aws:PrincipalTag/project, require the project tag on creation through aws:RequestTag, and deny changes to the project tag.`,
        `Create one permission set per project and assign each project's group to it in the three accounts.`,
        `Move each project to its own AWS account and use SCPs to limit what each project can do.`,
        `Create IAM groups in each account for each project and add IAM users to them based on a nightly export from the IdP.`
      ],
      answer: [0],
      explanation: `<b>A is correct.</b> ABAC with session tags lets a single permission set serve every project: access follows matching tags, new projects only need new tag values, and controlling tags at creation and blocking tag changes keeps users from reaching other projects' resources.<br><b>B</b> is the role-per-project sprawl the company wants to stop.<br><b>C</b> might be a good long-term structure but is a large re-architecture and still needs new accounts and policies per project.<br><b>D</b> reintroduces IAM users, long-term credentials and a custom sync job.`
    },
    {
      id: 'sap-055', domain: 'org', lesson: 'p-hybrid-edge', multi: false,
      question: `A hospital group runs medical imaging systems in its own data center. A new AI-assisted image analysis application must process images within a few milliseconds of the imaging devices, and regulations require that patient images remain on hospital premises. The development team wants to use the same EC2, EBS, Amazon EKS and Amazon RDS APIs and tooling it uses in the AWS Region, managed from the existing AWS accounts. Which solution should the solutions architect recommend?`,
      options: [
        `Deploy the application in the nearest AWS Local Zone and connect it to the data center with AWS Direct Connect.`,
        `Deploy the application in an AWS Wavelength Zone of the hospital's mobile carrier.`,
        `Run the application on AWS Snowball Edge Compute Optimized devices installed in the data center.`,
        `Install an AWS Outposts rack in the hospital data center, connect its service link to the parent Region, and run the application on EC2, EKS and RDS on Outposts with a local gateway to the imaging network.`
      ],
      answer: [3],
      explanation: `<b>D is correct.</b> Outposts racks place AWS-managed infrastructure on premises, keep data local, provide very low latency to on-premises systems through the local gateway, and support EC2, EBS, EKS and RDS with the same APIs and accounts.<br><b>A</b> a Local Zone is an AWS facility, so images would leave hospital premises, and the extra network hop adds latency.<br><b>B</b> Wavelength targets mobile devices on a 5G network and also runs outside the hospital.<br><b>C</b> Snowball Edge is designed for disconnected or rugged edge sites and data transfer, not a continuously managed production platform offering RDS and EKS.`
    },
    {
      id: 'sap-056', domain: 'org', lesson: 'p-hybrid-edge', multi: true,
      question: `A manufacturer runs its plant-floor control application on an AWS Outposts rack in each factory. During a recent fiber cut, the Outpost lost its service link for six hours. The running instances continued to serve local users, but an Auto Scaling group could not replace a failed instance and the plant ran at reduced capacity. The company wants the plant to keep full capacity during future service link outages. Which actions should the solutions architect recommend? (Choose TWO.)`,
      options: [
        `Provision enough running instances on the Outpost in advance (N+1 capacity) so that losing an instance during a disconnection does not require launching a replacement.`,
        `Provide redundant service link connectivity over physically diverse paths, for example a Direct Connect connection plus a separate internet-based path.`,
        `Configure the Auto Scaling group with a shorter health check grace period so that replacements launch faster while disconnected.`,
        `Store all application data in Amazon S3 in the parent Region so that instances are stateless.`,
        `Enable automatic failover of the Outpost to the nearest Local Zone during service link outages.`
      ],
      answer: [0, 1],
      explanation: `<b>A and B are correct.</b> Launching instances is a control-plane action that needs the service link, so the plant must already have spare capacity running (static stability), and diverse service link paths reduce the chance of disconnection.<br><b>C</b> Auto Scaling still cannot launch instances on the Outpost without the Region's control plane, however short the grace period.<br><b>D</b> makes the plant dependent on the Region for data – exactly what fails during a disconnection.<br><b>E</b> no such automatic failover exists, and moving plant-floor processing off site would break the latency requirement.`
    },
    {
      id: 'sap-057', domain: 'org', lesson: 'p-hybrid-edge', multi: false,
      question: `A media company backs up 400 TB of on-premises data each month with commercial backup software that writes to an aging physical tape library. Tapes are shipped off site for 10 years of retention, and restores of older data are rare. The company wants to eliminate physical tapes and off-site shipping, keep its existing backup software and procedures, and minimize storage cost for long-term retention. What should the solutions architect recommend?`,
      options: [
        `Deploy an Amazon S3 File Gateway and reconfigure the backup software to write backup files to an SMB share, with an S3 Lifecycle rule to S3 Standard-IA.`,
        `Deploy AWS Storage Gateway Tape Gateway as a virtual tape library, point the backup software at the iSCSI VTL, and archive ejected tapes to S3 Glacier Deep Archive.`,
        `Deploy Volume Gateway in stored mode and schedule EBS snapshots for retention.`,
        `Use AWS DataSync to copy the backup catalog and data to Amazon EFS each month.`
      ],
      answer: [1],
      explanation: `<b>B is correct.</b> Tape Gateway presents an iSCSI virtual tape library that existing backup software supports without procedural changes, and archived tapes move to S3 Glacier Deep Archive, the lowest-cost tier for rarely accessed long-term data.<br><b>A</b> changes the backup target and procedures, and Standard-IA is far more expensive than Deep Archive for 10-year retention.<br><b>C</b> Volume Gateway is block storage for applications, not a tape replacement, and snapshot retention is costlier and changes procedures.<br><b>D</b> EFS is an expensive primary file system, not an archive, and abandons the backup software workflow.`
    },
    {
      id: 'sap-058', domain: 'org', lesson: 'p-hybrid-connectivity', multi: false,
      question: `A global company operates VPCs in nine AWS Regions. Each Region has its own Transit Gateway, and the network team maintains a full mesh of inter-Region Transit Gateway peering attachments with hundreds of static routes. Production, development and shared-services traffic must stay segmented globally, and the team spends days on every new Region or VPC rollout. The company wants a centrally defined global network with automatic route propagation between Regions and segment-based isolation. What should the solutions architect recommend?`,
      options: [
        `Replace Transit Gateway peering with VPC peering between every pair of VPCs across Regions.`,
        `Keep the Transit Gateway mesh and write a Lambda function that updates static routes on every peering attachment when VPCs change.`,
        `Deploy AWS Cloud WAN with a core network policy that defines production, development and shared-services segments with sharing rules, and attach the VPCs (or existing Transit Gateways) to the core network.`,
        `Build a mesh of AWS Site-to-Site VPN connections between the Transit Gateways and run BGP over the tunnels.`
      ],
      answer: [2],
      explanation: `<b>C is correct.</b> Cloud WAN builds a global core network from a single declarative policy, propagates routes automatically between Regions, and isolates traffic with segments and explicit sharing rules – exactly the operational pain the mesh creates.<br><b>A</b> VPC peering is non-transitive and would require thousands of connections with no segmentation model.<br><b>B</b> automates the symptom with custom code that must be maintained and still leaves a complex static mesh.<br><b>D</b> VPN tunnels add bandwidth limits and cost, and TGW peering already uses the AWS backbone; it does not simplify management.`
    },
    {
      id: 'sap-059', domain: 'org', lesson: 'p-multi-account-strategy', multi: true,
      question: `A company is hardening its AWS Organizations guardrails for all workload OUs. Requirements: workloads may run only in eu-west-1 and eu-central-1, but global services such as IAM, Route 53, CloudFront and AWS Support must keep working; member accounts must not be able to leave the organization; and the IAM role that the security team uses to manage baseline resources must not be modified or deleted by anyone else. Which SCP statements should the solutions architect implement? (Choose THREE.)`,
      options: [
        `A Deny statement with NotAction listing the global services, applied when aws:RequestedRegion is not eu-west-1 or eu-central-1.`,
        `A Deny statement for organizations:LeaveOrganization.`,
        `A Deny statement for iam:* actions on the security team's role ARN, with a condition that excludes requests where aws:PrincipalArn matches the security team's role.`,
        `An Allow statement that grants iam:* to the security team's role so that it can manage baseline resources.`,
        `Attach the Region-restriction SCP to the management account so that it is also restricted.`,
        `Replace the FullAWSAccess policy at the root with an allow list containing only the services in use, without testing, to reduce risk quickly.`
      ],
      answer: [0, 1, 2],
      explanation: `<b>A, B and C are correct.</b> The NotAction pattern denies regional actions outside the approved Regions while exempting global services; denying LeaveOrganization keeps accounts under governance; and a deny on the role with a PrincipalArn exception protects the security role from everyone else.<br><b>D</b> SCPs never grant permissions; the role still needs an identity policy.<br><b>E</b> SCPs do not apply to the management account, so attaching them there has no effect.<br><b>F</b> an untested allow-list SCP at the root is likely to break legitimate workloads; guardrails should be trialled in a policy staging OU first.`
    },
    {
      id: 'sap-060', domain: 'org', lesson: 'p-access-control-at-scale', multi: false,
      question: `A company runs 70 application accounts, each with its own VPC, NAT gateways and Transit Gateway attachment. The network team wants to reduce cost and IP address sprawl and keep full control of routing, NAT, and network ACLs, while application teams keep separate accounts for billing and IAM isolation and continue to launch their own EC2 instances, RDS databases and load balancers. Which approach meets these requirements with the least operational overhead?`,
      options: [
        `Keep a VPC per account but replace the Transit Gateway with VPC peering to a shared egress VPC.`,
        `Move all application resources into the network account and give application teams IAM roles there.`,
        `Create a single large VPC in each application account and use AWS Firewall Manager to manage its route tables.`,
        `Create shared VPCs per environment in the network account and share application subnets with the application accounts by using AWS RAM, so participants launch resources into the shared subnets while the network account owns route tables, NAT gateways and network ACLs.`
      ],
      answer: [3],
      explanation: `<b>D is correct.</b> VPC sharing lets participant accounts create resources in centrally owned subnets while the owner account controls the VPC, routing, gateways and NACLs. It reduces VPC, NAT and attachment counts but preserves account-level billing and IAM separation.<br><b>A</b> peering is non-transitive, cannot provide centralized internet egress through another VPC's NAT gateway, and keeps 70 VPCs.<br><b>B</b> collapses the account boundaries the company wants to keep.<br><b>C</b> Firewall Manager manages security policies, not VPC route tables, and still leaves 70 VPCs.`
    },
    {
      id: 'sap-061', domain: 'org', lesson: 'p-dns-privatelink-inspection', multi: false,
      question: `A company runs 140 microservices owned by different teams across 50 AWS accounts. Many VPCs have overlapping CIDR ranges. Services communicate over HTTPS and gRPC, and the security team wants service-to-service authorization expressed as IAM-style policies (for example, only the orders service may call the payments service), without managing Transit Gateway route tables, PrivateLink endpoints for each service pair, or sidecar proxies. What should the solutions architect recommend?`,
      options: [
        `Create an Amazon VPC Lattice service network in a central account, share it with the application accounts through AWS RAM, associate the VPCs and register each service, and use auth policies on the service network and services.`,
        `Attach all VPCs to a Transit Gateway and use security groups referencing CIDR ranges to control service-to-service access.`,
        `Create a PrivateLink endpoint service for every microservice and an interface endpoint in every consumer VPC.`,
        `Peer all VPCs and use Route 53 private hosted zones for service discovery.`
      ],
      answer: [0],
      explanation: `<b>A is correct.</b> VPC Lattice connects services across accounts and VPCs (including overlapping CIDRs) at the application layer, and auth policies evaluated with IAM provide caller-based authorization without route tables, per-pair endpoints or sidecars.<br><b>B</b> Transit Gateway cannot route between overlapping CIDRs, and CIDR-based rules do not express service identity.<br><b>C</b> works for overlapping CIDRs but creates hundreds of endpoint services and endpoints to manage, and provides no IAM-style service authorization.<br><b>D</b> peering fails with overlapping CIDRs and does not scale to 50 accounts.`
    },
    // ---------------- new (expanded) ----------------
    {
      id: 'sap-062', domain: 'new', lesson: 'p-data-analytics', multi: false,
      question: `An insurance group is building a data mesh. Eight producer accounts store curated datasets in Amazon S3 and catalog them in the AWS Glue Data Catalog. Analysts in 20 consumer accounts query the data with Amazon Athena and Amazon EMR. Columns tagged as PII must be visible only to an approved analyst group, rows must be restricted by country for regional teams, and the central data governance team wants to manage grants by data classification rather than per table as hundreds of tables are added. What should the solutions architect recommend?`,
      options: [
        `Write S3 bucket policies in each producer account that grant consumer account roles access to specific prefixes, and use Glue Data Catalog resource policies for metadata access.`,
        `Copy curated datasets into a bucket in each consumer account every night with S3 Batch Replication and remove PII columns during the copy.`,
        `Register the producer S3 locations with AWS Lake Formation, define LF-Tags for domain and classification, tag databases, tables and PII columns, grant permissions on LF-Tag expressions to consumer accounts, use data filters for country-based row restrictions, and have consumer accounts create resource links.`,
        `Load all datasets into a single Amazon Redshift cluster and create database users for each analyst with column-level GRANT statements.`
      ],
      answer: [2],
      explanation: `<b>C is correct.</b> Lake Formation enforces column, row and cell-level access for Athena and EMR, LF-Tags let the governance team grant by classification instead of per table, cross-account grants are shared through RAM, and resource links surface the shared tables in consumer catalogs.<br><b>A</b> bucket policies work at object and prefix level and cannot hide columns or filter rows inside files.<br><b>B</b> creates many stale copies, high storage and pipeline cost, and still cannot do per-group column visibility.<br><b>D</b> abandons the S3 data mesh and per-account compute, and centralizes all data into one cluster with per-user grants that do not scale.`
    },
    {
      id: 'sap-063', domain: 'new', lesson: 'p-data-analytics', multi: true,
      question: `A marketing analytics team stores 3 years of clickstream data in Amazon S3 as uncompressed CSV files, written as thousands of small files per hour. Analysts run Amazon Athena queries that usually filter on event date and select a handful of columns, but each query scans many terabytes, runs for minutes and costs far more than budgeted. Occasionally an analyst's mistaken query scans the entire dataset. Which actions will MOST reduce cost and improve performance? (Choose TWO.)`,
      options: [
        `Use an AWS Glue ETL job (or Athena CTAS) to rewrite the data into compressed Apache Parquet, partitioned by event date and compacted into larger files, and update queries to filter on the partition column.`,
        `Move the CSV files to S3 Glacier Flexible Retrieval to reduce storage cost.`,
        `Enable S3 Transfer Acceleration on the bucket so that Athena reads data faster.`,
        `Configure Athena workgroups with per-query data usage controls that cancel queries exceeding a scan threshold.`,
        `Increase the number of Athena workgroups so that queries run in parallel.`
      ],
      answer: [0, 3],
      explanation: `<b>A and D are correct.</b> Columnar, compressed, partitioned and compacted data lets Athena read only the needed columns and partitions, reducing data scanned (the billing unit) and runtime. Workgroup data usage controls stop runaway queries.<br><b>B</b> Athena cannot query objects in Glacier Flexible Retrieval without restoring them.<br><b>C</b> Transfer Acceleration speeds client uploads over long distances; it does nothing for Athena reads.<br><b>E</b> more workgroups do not reduce the data each query scans.`
    },
    {
      id: 'sap-064', domain: 'new', lesson: 'p-data-analytics', multi: false,
      question: `A retailer runs a central Amazon Redshift RA3 cluster that ingests sales data every 15 minutes. Finance, merchandising and supply-chain teams each have their own AWS accounts and need to query the latest sales tables with complex joins. Currently a nightly UNLOAD/COPY process copies tables into each team's cluster, so data is stale and storage is triplicated, and heavy merchandising queries slow down the central cluster. What should the solutions architect recommend?`,
      options: [
        `Enable concurrency scaling on the central cluster and give each team database users on it.`,
        `Create Redshift datashares on the central producer cluster and share them with the teams' accounts, where each team queries the shared data from its own Redshift Serverless workgroup or RA3 cluster.`,
        `Export the tables to S3 every 15 minutes and have each team query them with Redshift Spectrum.`,
        `Create read replicas of the Redshift cluster in each team's account.`
      ],
      answer: [1],
      explanation: `<b>B is correct.</b> Redshift data sharing provides live, transactionally consistent access to producer data across accounts without copying, and each consumer uses its own compute, isolating heavy workloads from the producer.<br><b>A</b> keeps all teams' queries on the central cluster and its account, so workload isolation and account separation are not achieved.<br><b>C</b> still runs a copy pipeline every 15 minutes and adds latency and complexity.<br><b>D</b> Redshift does not offer read replicas in other accounts; data sharing is the mechanism for this.`
    },
    {
      id: 'sap-065', domain: 'new', lesson: 'p-data-analytics', multi: false,
      question: `An online travel company stores bookings in an Amazon Aurora MySQL cluster. Analysts need booking data in Amazon Redshift within seconds to minutes of each transaction for operational dashboards. The data engineering team currently maintains an AWS DMS task and a custom Lambda-based loader that frequently breaks on schema changes. The company wants to remove the pipeline maintenance burden without affecting the Aurora workload. What should the solutions architect recommend?`,
      options: [
        `Run hourly Aurora exports to S3 in Parquet and query them with Redshift Spectrum.`,
        `Replace the DMS task with Amazon Data Firehose reading from the Aurora binary log.`,
        `Configure Aurora to stream changes to Kinesis Data Streams and build a Managed Service for Apache Flink application that writes to Redshift.`,
        `Create an Aurora MySQL zero-ETL integration with Amazon Redshift and point the dashboards at the replicated tables in Redshift.`
      ],
      answer: [3],
      explanation: `<b>D is correct.</b> A zero-ETL integration continuously replicates Aurora data into Redshift in near real time, managed by AWS with no pipeline code to maintain, and is designed to minimize impact on the source.<br><b>A</b> hourly exports violate the seconds-to-minutes freshness requirement.<br><b>B</b> Firehose cannot read a MySQL binary log as a source.<br><b>C</b> is a custom streaming pipeline – more components to maintain, not fewer.`
    },
    {
      id: 'sap-066', domain: 'new', lesson: 'p-data-analytics', multi: false,
      question: `An industrial IoT company receives telemetry from 200,000 sensors as JSON records. The data must land in Amazon S3 as compressed Parquet, partitioned by customer ID and date so that Athena queries are efficient, with delivery latency of a few minutes acceptable. The team wants no servers, no consumer applications and no custom batching code to operate. Which solution meets these requirements?`,
      options: [
        `Send records to Amazon Data Firehose with record format conversion to Parquet using a schema from the AWS Glue Data Catalog and dynamic partitioning on customer ID and date, delivering to S3.`,
        `Send records to Kinesis Data Streams and run a Kinesis Client Library application on an EC2 Auto Scaling group that writes Parquet files to S3.`,
        `Send records to Amazon MSK and deploy a self-managed Kafka Connect cluster on EC2 with an S3 sink connector.`,
        `Invoke a Lambda function for each record that appends the record to a Parquet file in S3.`
      ],
      answer: [0],
      explanation: `<b>A is correct.</b> Firehose is fully managed delivery: it buffers records, converts JSON to Parquet using a Glue schema, partitions output dynamically by keys in the data, and writes to S3 with minute-level latency and no code.<br><b>B</b> requires building and operating consumer applications on EC2.<br><b>C</b> introduces a Kafka cluster and a self-managed Connect fleet.<br><b>D</b> S3 objects cannot be appended to, and per-record invocations would produce millions of tiny files and high cost.`
    },
    {
      id: 'sap-067', domain: 'new', lesson: 'p-resilience-engineering', multi: false,
      question: `A SaaS company runs a document-rendering API on a fleet of 16 containerized workers behind a load balancer, shared by 2,000 tenants. Last month a single tenant submitted documents that triggered a rendering bug, crashing workers one by one as the load balancer retried the requests elsewhere, until the entire fleet was down for all tenants. The company wants to limit the impact of any single tenant's problematic workload to a small fraction of tenants without running a separate fleet per tenant. What should the solutions architect recommend?`,
      options: [
        `Increase the worker count to 64 so that the fleet takes longer to fail.`,
        `Configure the load balancer with a longer deregistration delay and slow start mode.`,
        `Implement shuffle sharding: assign each tenant to a unique combination of a few workers (for example 2 of 16) through a routing layer, so a poison tenant can only take down its own combination and tenants that overlap on one worker can retry on their other worker.`,
        `Deploy one dedicated worker per tenant on AWS Fargate.`
      ],
      answer: [2],
      explanation: `<b>C is correct.</b> Shuffle sharding gives each tenant a nearly unique combination of workers, so a poison workload crashes only that combination. Only the few tenants mapped to the identical pair are fully affected (16 workers give 120 possible pairs); tenants that share one worker degrade partially and retry on their other worker. It isolates without dedicated fleets.<br><b>A</b> only delays the same cascading failure because the bad requests are still retried across the whole fleet.<br><b>B</b> load balancer connection settings do not prevent the bad requests from reaching every worker.<br><b>D</b> provides isolation but at the cost of 2,000 dedicated workers, which the company wants to avoid.`
    },
    {
      id: 'sap-068', domain: 'new', lesson: 'p-resilience-engineering', multi: true,
      question: `A microservices platform has an edge service that calls an orders service, which calls an inventory service, which calls a database. Each layer retries failed calls three times immediately. During a brief database slowdown, request volume to the database increased by more than 20 times and the slowdown became a 45-minute outage. Which changes should the solutions architect recommend to prevent this from recurring? (Choose TWO.)`,
      options: [
        `Increase the retry count at every layer to five so that more requests eventually succeed.`,
        `Use capped exponential backoff with jitter for retries (for example, the AWS SDK standard or adaptive retry mode) and set timeouts at each layer below the caller's timeout.`,
        `Raise all client timeouts to five minutes so that requests wait for the database to recover.`,
        `Retry at only one layer of the call chain, add a retry budget or circuit breaker that stops calls to a failing dependency, and shed excess load early with throttling.`,
        `Add a second database and send every request to both databases in parallel.`
      ],
      answer: [1, 3],
      explanation: `<b>B and D are correct.</b> Backoff with jitter spreads retries out instead of hammering the dependency in synchronized waves, and sane timeouts prevent resource exhaustion. Retrying at a single layer avoids multiplicative retry amplification (3 × 3 × 3 = 27 attempts), and circuit breakers, retry budgets and load shedding stop piling load onto a struggling dependency.<br><b>A</b> amplifies traffic even more.<br><b>C</b> ties up threads and connections throughout the stack, turning slowness into exhaustion.<br><b>E</b> doubles load on the data tier and introduces consistency problems without addressing amplification.`
    },
    {
      id: 'sap-069', domain: 'new', lesson: 'p-resilience-engineering', multi: false,
      question: `A payroll SaaS provider serves 9,000 business customers from one large regional deployment of ECS services, SQS queues and DynamoDB tables. Two recent incidents – a bad configuration push and a runaway batch from one large customer – each affected every customer. Leadership wants future incidents and deployments to affect only a small, bounded percentage of customers, and wants to grow by adding capacity in known, tested units. Which architecture should the solutions architect recommend?`,
      options: [
        `Scale the existing deployment vertically and add more Availability Zones.`,
        `Adopt a cell-based architecture: deploy multiple independent, identically built cells (each with its own services, queues and tables), route each customer to a cell through a thin routing layer backed by a customer-to-cell mapping, cap cell size, and roll out changes one cell at a time.`,
        `Create a separate AWS account per customer with a full copy of the stack.`,
        `Use blue/green deployments for the existing stack so that configuration pushes can be rolled back quickly.`
      ],
      answer: [1],
      explanation: `<b>B is correct.</b> Cells bound the blast radius of failures and deployments to the customers in one cell, cell-by-cell rollouts catch bad changes early, and adding new tested cells is the scaling unit.<br><b>A</b> keeps a single shared failure domain for all customers.<br><b>C</b> isolates customers but 9,000 full stacks is operationally and financially impractical.<br><b>D</b> speeds rollback but every customer is still affected when the bad change goes live, and it does nothing for noisy customers.`
    },
    {
      id: 'sap-070', domain: 'new', lesson: 'p-resilience-engineering', multi: false,
      question: `A bank runs an active/passive application in us-east-1 and us-west-2 using Aurora Global Database, ECS services that run at minimal size in the standby Region, and Route 53 records for routing. A Region failover requires about 15 ordered manual steps (fail over the global database, scale ECS services, update routing, and verify), which took 3 hours in the last test because engineers were unsure of the order. The bank wants failover executed as a repeatable, pre-approved plan from the healthy Region, with progress visible to stakeholders. What should the solutions architect recommend?`,
      options: [
        `Document the steps in a wiki runbook and hold a quarterly tabletop exercise.`,
        `Write a Lambda function in us-east-1 that runs all the steps when a CloudWatch alarm fires.`,
        `Replace Aurora Global Database with DynamoDB global tables so that no database failover is needed.`,
        `Use Amazon Route 53 Application Recovery Controller Region switch to author a plan that orchestrates the Aurora Global Database failover, ECS scaling and routing steps, and execute and rehearse it from the standby Region.`
      ],
      answer: [3],
      explanation: `<b>D is correct.</b> ARC Region switch runs pre-authored, ordered failover plans – including database failover, scaling and routing steps – from the Region you are failing over to, with execution status visible, so the process is repeatable and rehearsable.<br><b>A</b> leaves the same error-prone manual ordering that caused the 3-hour test.<br><b>B</b> places the automation in the Region likely to be impaired and makes failover automatic rather than a pre-approved decision.<br><b>C</b> is a major re-architecture of the data layer and changes consistency semantics; it does not address orchestration of the other steps.`
    },
    {
      id: 'sap-071', domain: 'new', lesson: 'p-multi-region-active-active', multi: false,
      question: `A logistics company runs a web application on EC2 instances in an Auto Scaling group with an Amazon Aurora PostgreSQL database in eu-west-1. Its disaster recovery requirements for a Regional outage are an RPO of under 1 minute and an RTO of under 30 minutes. The CFO insists on the lowest ongoing cost that meets the targets. Which DR design should the solutions architect recommend?`,
      options: [
        `Pilot light: add an Aurora Global Database secondary cluster in eu-central-1, copy AMIs and keep infrastructure as code ready there with the Auto Scaling group at zero or minimal capacity, and on failover promote the secondary, scale out the group, and switch DNS.`,
        `Warm standby: run a full-size copy of the application tier in eu-central-1 at all times, with an Aurora Global Database secondary.`,
        `Backup and restore: copy daily AWS Backup snapshots of Aurora and EC2 to eu-central-1 and restore them during a disaster.`,
        `Multi-site active/active: serve traffic from both Regions with Aurora Global Database write forwarding.`
      ],
      answer: [0],
      explanation: `<b>A is correct.</b> Aurora Global Database replication (typically under one second) meets the RPO, and keeping compute off or minimal with ready AMIs and templates allows recovery within tens of minutes – the cheapest option that meets both targets.<br><b>B</b> meets the targets but a full-size standby costs much more than needed for a 30-minute RTO.<br><b>C</b> daily snapshots give an RPO of up to 24 hours and restores take longer than 30 minutes.<br><b>D</b> exceeds the requirements at the highest cost.`
    },
    {
      id: 'sap-072', domain: 'new', lesson: 'p-event-driven-serverless', multi: true,
      question: `An order service publishes events such as OrderPlaced, OrderCancelled and OrderShipped. Three new consumers are being added: a billing service that needs OrderPlaced and OrderCancelled, a warehouse service that needs only OrderPlaced, and an analytics service that needs every event. Each consumer must receive its own copy of the relevant events, process at its own pace, survive its own downtime without losing events, and the order service must not be modified for each new consumer. Which combination of steps meets these requirements? (Choose TWO.)`,
      options: [
        `Publish events to an Amazon SNS topic and subscribe a separate Amazon SQS queue for each consumer service.`,
        `Add SNS subscription filter policies on the event type for the billing and warehouse subscriptions, leaving the analytics subscription unfiltered.`,
        `Have all three services poll a single shared SQS standard queue and discard events they do not need.`,
        `Have the order service call each consumer's REST API synchronously after every order change.`,
        `Publish events to an SQS FIFO queue with one message group ID per consumer.`
      ],
      answer: [0, 1],
      explanation: `<b>A and B are correct.</b> SNS-to-SQS fan-out gives every consumer its own durable queue that buffers events during consumer downtime, and filter policies deliver only relevant event types; new consumers simply add subscriptions.<br><b>C</b> with a shared queue each message is consumed by only one service, so others miss it.<br><b>D</b> tightly couples the services, loses events when a consumer is down, and requires changing the order service for each consumer.<br><b>E</b> a queue still delivers each message to one consumer; message groups control ordering, not fan-out.`
    },
    {
      id: 'sap-073', domain: 'new', lesson: 'p-identity-federation', multi: false,
      question: `A B2B SaaS company is launching a multi-tenant web application on Amazon API Gateway and AWS Lambda. Each enterprise customer wants its employees to sign in with the customer's own corporate SAML 2.0 or OIDC identity provider, and the application must know which tenant each request belongs to for data isolation. Smaller customers without an IdP need email and password sign-in with MFA. What should the solutions architect recommend?`,
      options: [
        `Use IAM Identity Center, add each customer's IdP as an identity source, and assign application access through permission sets.`,
        `Create IAM users for every customer employee and use IAM authorization on the API.`,
        `Use an Amazon Cognito user pool, federate each enterprise tenant's SAML or OIDC IdP into it, allow native sign-up with MFA for smaller tenants, put the tenant ID in a custom attribute or token claim, and protect the API with a Cognito user pool authorizer.`,
        `Use a Cognito identity pool with guest access and pass the tenant ID as a query string parameter.`
      ],
      answer: [2],
      explanation: `<b>C is correct.</b> Cognito user pools support many SAML and OIDC IdPs plus native users with MFA, can carry a tenant identifier in tokens, and integrate directly with API Gateway authorizers.<br><b>A</b> Identity Center supports only one identity source per instance and is for workforce access, not a customer-facing multi-tenant app.<br><b>B</b> IAM users for external customers' employees do not scale and cannot federate per tenant.<br><b>D</b> guest identities are unauthenticated and a client-supplied tenant ID can be forged.`
    },
    // ---------------- improve (expanded) ----------------
    {
      id: 'sap-074', domain: 'improve', lesson: 'p-operations-at-scale', multi: false,
      question: `A company has about 3,000 Amazon EC2 instances running Amazon Linux, Windows Server and Ubuntu across 60 accounts and four Regions. Each team patches differently, and auditors found critical patches missing for months. The operations team, which works from a delegated administrator account, must apply consistent patch baselines on a schedule in every account and Region, automatically include new accounts and instances, and report organization-wide patch compliance. Which solution requires the least operational overhead?`,
      options: [
        `Create a cron job on each instance that runs the operating system package manager weekly and emails the results.`,
        `Use Systems Manager Quick Setup to create an organization-wide patch policy targeting all OUs and the four Regions, with patch baselines per operating system and a scan-and-install schedule, and view compliance centrally (for example through Systems Manager Explorer or a resource data sync to S3 queried with Athena).`,
        `Build golden AMIs monthly with EC2 Image Builder and require teams to replace their instances with the new AMI.`,
        `Run a Systems Manager Run Command document from each account once a month to install all available updates.`
      ],
      answer: [1],
      explanation: `<b>B is correct.</b> Quick Setup patch policies deploy Patch Manager configuration across the organization's accounts and Regions from the management or delegated admin account, cover new accounts and instances automatically, and feed compliance data that can be viewed centrally.<br><b>A</b> is unmanaged, inconsistent and produces no central compliance view.<br><b>C</b> image pipelines are good practice but relying on teams to replace instances does not guarantee patching of running instances or report compliance.<br><b>D</b> is manual per account and Region, installs everything without baselines, and does not report compliance consistently.`
    },
    {
      id: 'sap-075', domain: 'improve', lesson: 'p-operations-at-scale', multi: true,
      question: `A company runs 180 accounts. Application logs are written to CloudWatch Logs in each account. The security team requires that all application logs be copied to a central Log Archive account within minutes, retained for seven years in a form that no one can delete or alter, and that the solution automatically covers new log groups. Which combination of steps should the solutions architect take? (Choose TWO.)`,
      options: [
        `Schedule a CloudWatch Logs export task (CreateExportTask) every hour in each account to export every log group to the Log Archive bucket.`,
        `Create IAM users in each account with access keys that a central script uses to download logs nightly.`,
        `Create a CloudWatch Logs destination in the Log Archive account backed by Amazon Data Firehose that delivers to S3, and configure account-level subscription filter policies in each account that send all log groups to that cross-account destination.`,
        `Send all application logs to the management account so that SCPs protect them.`,
        `Enable S3 Object Lock in compliance mode with a seven-year default retention on the Log Archive bucket.`
      ],
      answer: [2, 4],
      explanation: `<b>C and E are correct.</b> A cross-account destination with Firehose delivers logs within minutes, and account-level subscription filter policies apply to all current and new log groups. Compliance-mode Object Lock makes the archived objects immutable for seven years, even for the root user.<br><b>A</b> export tasks are batch jobs that run one at a time per account, which does not meet the minutes requirement across many log groups.<br><b>B</b> introduces long-term credentials and a nightly custom process.<br><b>D</b> SCPs do not apply to the management account, and running workloads or log storage there is an anti-pattern.`
    },
    {
      id: 'sap-076', domain: 'improve', lesson: 'p-operations-at-scale', multi: false,
      question: `After a security incident, investigators must regularly answer questions such as "which principals called DeleteBucketPolicy in any account in the last four years". The organization trail writes CloudTrail logs to S3, but analysts struggle with creating and maintaining Athena tables and partitions across 200 accounts and many Regions. The security team, working from a delegated administrator account, wants to run SQL directly over organization-wide CloudTrail events with multi-year retention and minimal setup. What should the solutions architect recommend?`,
      options: [
        `Create an AWS CloudTrail Lake organization event data store from the delegated administrator account with a multi-year retention period, and run SQL queries in CloudTrail Lake.`,
        `Use the CloudTrail Event history console in each account.`,
        `Load CloudTrail logs into an Amazon RDS for PostgreSQL database with a nightly AWS Glue job.`,
        `Enable Amazon GuardDuty and use its findings to answer the questions.`
      ],
      answer: [0],
      explanation: `<b>A is correct.</b> CloudTrail Lake event data stores collect events organization-wide, retain them for years, and support SQL queries without managing tables or partitions.<br><b>B</b> Event history covers only 90 days of management events per account and Region.<br><b>C</b> is a custom pipeline and database to operate and scale.<br><b>D</b> GuardDuty produces threat findings, not a queryable record of every API call.`
    },
    {
      id: 'sap-077', domain: 'improve', lesson: 'p-operations-at-scale', multi: false,
      question: `A compliance team must produce a weekly report of every Amazon EBS volume that is unencrypted and every security group that allows inbound 0.0.0.0/0 on port 22, across 90 accounts and 8 Regions, along with the compliance status of 40 AWS Config rules. The team works from a security account that is the delegated administrator for AWS Config. The report must be generated from current configuration data without logging in to each account. What should the solutions architect recommend?`,
      options: [
        `Ask each account owner to export AWS Config data to CSV weekly and merge the files.`,
        `Use AWS Trusted Advisor in each account and export its checks.`,
        `Enable Amazon Inspector in all accounts and filter its findings for EBS encryption and security group rules.`,
        `Create an organization-wide AWS Config aggregator in the delegated administrator account covering all Regions, use the aggregator's compliance view for rule status, and run advanced queries against the aggregator to list unencrypted volumes and open security groups.`
      ],
      answer: [3],
      explanation: `<b>D is correct.</b> An organization aggregator collects configuration and compliance data from all accounts and Regions into the delegated administrator account, and advanced queries let the team query current resource configuration with SQL-like syntax across the aggregator.<br><b>A</b> is manual and error-prone.<br><b>B</b> Trusted Advisor checks are per account and do not report on custom Config rules.<br><b>C</b> Inspector scans for software vulnerabilities and network reachability; it is not a configuration inventory and does not report Config rule compliance.`
    },
    {
      id: 'sap-078', domain: 'improve', lesson: 'p-operations-at-scale', multi: false,
      question: `The operations team requires that the CloudWatch agent be installed and configured with a standard configuration from Parameter Store on every EC2 instance in 40 accounts, including instances launched later by any method, and that drift (for example, someone uninstalling the agent) be corrected automatically. All instances are already managed by Systems Manager. What should the solutions architect recommend?`,
      options: [
        `Add the agent installation commands to the user data of every launch template.`,
        `Run a Systems Manager Run Command document across all instances once.`,
        `Create Systems Manager State Manager associations (for example through Quick Setup across the organization) that install the CloudWatch agent and apply the configuration from Parameter Store, targeting all managed instances on a recurring schedule.`,
        `Create a Lambda function that connects to each instance over SSH nightly to check for the agent.`
      ],
      answer: [2],
      explanation: `<b>C is correct.</b> State Manager associations continuously enforce desired state on a schedule, apply automatically to new managed instances that match the targets, and re-apply configuration when drift occurs; Quick Setup can deploy them across the organization.<br><b>A</b> only covers instances launched from those templates and never corrects later drift.<br><b>B</b> is a one-time action that misses future instances and drift.<br><b>D</b> is custom, requires SSH access and keys, and is fragile.`
    },
    {
      id: 'sap-079', domain: 'improve', lesson: 'p-operations-at-scale', multi: true,
      question: `A security team must run a Systems Manager Automation runbook that rotates a local administrator configuration on EC2 instances in 80 accounts across 5 Regions. The runbook must be started once from a central operations account, roll out gradually with limits on how many accounts run at the same time, and stop if too many executions fail. Which steps are required? (Choose THREE.)`,
      options: [
        `Create an IAM user with access keys in each target account for the runbook to use.`,
        `Deploy the AWS-SystemsManager-AutomationExecutionRole (or an equivalent execution role trusted by the central account) to every target account, for example with a service-managed StackSet.`,
        `Deploy a Lambda function in each target account that runs the runbook locally on a schedule.`,
        `Create the AWS-SystemsManager-AutomationAdministrationRole in the central operations account.`,
        `Open inbound SSH from the operations account's VPC to all instances.`,
        `Start a multi-account, multi-Region Automation execution from the central account that targets the OUs and Regions, with concurrency and error threshold settings.`
      ],
      answer: [1, 3, 5],
      explanation: `<b>B, D and F are correct.</b> Multi-account Automation uses an administration role in the central account that assumes an execution role in each target account; the execution itself specifies target accounts or OUs, Regions, and rate controls (concurrency and error thresholds) for gradual, safe rollout.<br><b>A</b> long-term IAM user credentials are unnecessary and insecure; Automation uses roles.<br><b>C</b> decentralizes execution and loses the single controlled rollout.<br><b>E</b> Systems Manager does not need inbound SSH; the agent communicates outbound.`
    },
    {
      id: 'sap-080', domain: 'improve', lesson: 'p-cost-optimization-governance', multi: false,
      question: `A company's analysis of its Cost and Usage Report shows that NAT gateway data processing charges are among its top five line items. Most of the traffic comes from EC2 instances in private subnets of 40 spoke VPCs reading and writing large objects in Amazon S3 buckets in the same Region, and from Lambda functions in the same VPCs writing to Amazon DynamoDB. Internet egress to other destinations must continue through the existing NAT gateways. Which change reduces cost the MOST with the least effort?`,
      options: [
        `Replace the NAT gateways with NAT instances on Graviton EC2 instances.`,
        `Create gateway VPC endpoints for Amazon S3 and Amazon DynamoDB in each spoke VPC and associate them with the private subnet route tables.`,
        `Create interface VPC endpoints for S3 and DynamoDB in a shared services VPC and route all spoke traffic to them through the Transit Gateway.`,
        `Move the S3 buckets to a different Region with lower storage prices.`
      ],
      answer: [1],
      explanation: `<b>B is correct.</b> Gateway endpoints for S3 and DynamoDB are free, route traffic privately through route table entries, and remove that traffic from NAT gateway (and Transit Gateway) processing charges with no application changes.<br><b>A</b> NAT instances add management burden and availability risk and still process the traffic.<br><b>C</b> interface endpoints carry hourly and per-GB charges, and routing through the Transit Gateway adds TGW data processing charges.<br><b>D</b> cross-Region access adds data transfer charges and latency.`
    },
    {
      id: 'sap-081', domain: 'improve', lesson: 'p-cost-optimization-governance', multi: false,
      question: `A company gives each developer a sandbox account in a Sandbox OU. Several developers have left expensive GPU instances running, generating thousands of dollars of charges. The company wants each sandbox account to be automatically prevented from launching new resources once its monthly spend reaches 500 USD, with notification to the developer, and without writing custom code. What should the solutions architect recommend?`,
      options: [
        `Create an AWS Budgets cost budget for each sandbox account with an alert to the developer and a budget action that, when the threshold is reached, applies a restrictive SCP (for example denying ec2:RunInstances and other create actions) to that account.`,
        `Enable AWS Cost Anomaly Detection and email the developers when anomalies are detected.`,
        `Create a CloudWatch billing alarm in the management account for the whole organization.`,
        `Attach an SCP to the Sandbox OU that denies all EC2 GPU instance types.`
      ],
      answer: [0],
      explanation: `<b>A is correct.</b> Budget actions can apply an IAM policy or an SCP automatically (or after approval) when a budget threshold is crossed, enforcing a per-account spend guardrail without custom code, and budgets notify subscribers.<br><b>B</b> anomaly detection notifies but does not prevent further spending, and spend under a fixed cap may not be anomalous.<br><b>C</b> an organization-wide alarm cannot act per sandbox account and only notifies.<br><b>D</b> blocks GPUs entirely, including legitimate experimentation, and does not cap spending on other resources.`
    },
    {
      id: 'sap-082', domain: 'improve', lesson: 'p-observability-performance', multi: false,
      question: `An order-processing application uses an Amazon Aurora MySQL cluster with one writer and two Aurora Replicas. A business intelligence tool now runs long analytical queries during business hours through the cluster reader endpoint, and customer-facing read queries routed to the same reader endpoint have become slow and inconsistent. The company wants to isolate the analytical workload from customer reads with minimal application change. What should the solutions architect do?`,
      options: [
        `Point the BI tool at the cluster writer endpoint.`,
        `Increase the instance class of the writer instance.`,
        `Enable Aurora Serverless v2 on the writer so that it scales during analytical queries.`,
        `Add an Aurora Replica dedicated to analytics and create an Aurora custom endpoint that contains only that replica for the BI tool, and a second custom endpoint containing the other replicas for customer-facing reads.`
      ],
      answer: [3],
      explanation: `<b>D is correct.</b> Aurora custom endpoints group specific instances, so the BI tool's heavy queries run on a dedicated replica while customer reads use separate replicas – only connection strings change.<br><b>A</b> moves analytics onto the writer and hurts transactional performance.<br><b>B</b> the slow queries run on readers, so a larger writer does not help.<br><b>C</b> scaling the writer does not isolate reader traffic, and analytics would still share the reader endpoint with customers.`
    },
    {
      id: 'sap-083', domain: 'improve', lesson: 'p-cost-optimization-governance', multi: true,
      question: `A genomics company runs two workloads on On-Demand EC2 instances. The first is a 24/7 API tier with a stable baseline that the team expects to move partly to AWS Fargate next year. The second is a nightly batch pipeline of containerized, checkpointing jobs that can be interrupted and restarted, currently using one instance type that is sometimes unavailable. Right-sizing has already been completed. Which purchasing changes will reduce cost the MOST while maintaining reliability? (Choose TWO.)`,
      options: [
        `Run the batch pipeline on Spot Instances diversified across many instance types and Availability Zones with a price-capacity-optimized allocation strategy.`,
        `Move both workloads to Dedicated Hosts.`,
        `Buy Convertible Reserved Instances for the peak capacity of the batch pipeline.`,
        `Purchase a Compute Savings Plan sized to the API tier's steady baseline usage.`,
        `Move the API tier to larger instance sizes to reduce the number of instances.`
      ],
      answer: [0, 3],
      explanation: `<b>A and D are correct.</b> Interruptible, checkpointing batch jobs are ideal for Spot, and diversifying instance types and AZs improves capacity availability. A Compute Savings Plan discounts the steady baseline and continues to apply after the move to Fargate.<br><b>B</b> Dedicated Hosts are for licensing or compliance and cost more.<br><b>C</b> committing to peak batch capacity that runs only at night wastes most of the commitment.<br><b>E</b> right-sizing is complete, and larger instances do not reduce the price per unit of compute.`
    },
    // ---------------- migrate (expanded) ----------------
    {
      id: 'sap-084', domain: 'migrate', lesson: 'p-modernization-patterns', multi: false,
      question: `A retailer is decomposing a monolithic order management system that runs on EC2 with an on-premises-style Oracle database hosted on Amazon RDS for Oracle. The first new microservice, a customer notification service, needs to react within seconds to order status changes. The monolith's code is fragile, and the team is not allowed to modify it to publish events. What should the solutions architect recommend?`,
      options: [
        `Have the notification service poll the monolith's orders table every second.`,
        `Add database triggers to the monolith's tables that call the notification service's API.`,
        `Use an AWS DMS task with ongoing replication (CDC) from the RDS for Oracle database to Amazon Kinesis Data Streams, and have the notification service consume the change stream.`,
        `Schedule nightly exports of the orders table to Amazon S3 and process them with AWS Glue.`
      ],
      answer: [2],
      explanation: `<b>C is correct.</b> DMS change data capture streams committed changes from the monolith's database to Kinesis without touching application code – the event interception pattern – and the new service consumes them within seconds.<br><b>A</b> aggressive polling adds load to the shared database and couples the new service to the monolith's schema.<br><b>B</b> triggers modify the monolith's database and add synchronous dependencies to every transaction.<br><b>D</b> nightly exports cannot meet a seconds-level requirement.`
    },
    {
      id: 'sap-085', domain: 'migrate', lesson: 'p-modernization-patterns', multi: false,
      question: `A company is applying the strangler fig pattern to a monolithic web application that runs on EC2 instances behind an internal Application Load Balancer in private subnets. New capabilities such as /orders and /returns are being built as AWS Lambda functions. The company wants a single public HTTPS entry point with JWT validation, wants requests for each path routed deterministically to either the monolith or the new function, and the monolith must not become internet-facing. What should the solutions architect recommend?`,
      options: [
        `Create Route 53 weighted records that send 20% of requests to the Lambda functions and 80% to the monolith.`,
        `Create an Amazon API Gateway HTTP API with a JWT authorizer, add routes for /orders and /returns that integrate with the Lambda functions, and a default route that integrates with the internal ALB through a VPC link.`,
        `Modify the monolith to call the Lambda functions for every order and return request.`,
        `Change the ALB scheme to internet-facing and add Lambda target groups for the new paths.`
      ],
      answer: [1],
      explanation: `<b>B is correct.</b> An HTTP API provides the public façade with JWT authorization, path-based routes to the new Lambda functions, and a private integration to the internal ALB through a VPC link, so the monolith stays private while capabilities are peeled off one by one.<br><b>A</b> weighted DNS splits traffic randomly rather than by capability, so the same path would hit different implementations.<br><b>C</b> deepens coupling with the monolith and requires changing it.<br><b>D</b> makes the monolith's load balancer internet-facing, violating the requirement (an ALB can route to Lambda, but not while staying internal for public users).`
    },
    {
      id: 'sap-086', domain: 'migrate', lesson: 'p-modernization-patterns', multi: true,
      question: `After decomposing a monolith, placing an order now involves an orders service (Amazon DynamoDB), a payments service (Amazon Aurora) and an inventory service (Amazon DynamoDB in another account). Previously a single database transaction kept them consistent. The company needs the order to either complete across all services or be reliably undone, and it must never publish an OrderPlaced event for an order whose write was rolled back. Which approaches should the solutions architect recommend? (Choose TWO.)`,
      options: [
        `Implement a two-phase commit coordinator that locks rows in all three databases.`,
        `Orchestrate the steps with an AWS Step Functions saga that calls each service and runs compensating actions (refund payment, release inventory, cancel order) when a later step fails.`,
        `Move all three services back to a single shared database so that one transaction covers everything.`,
        `Use the transactional outbox pattern: the orders service writes the order and the outgoing event in the same transaction (for example, an item whose DynamoDB stream is relayed to EventBridge), so events are published only for committed writes.`,
        `Have the orders service call payments and inventory synchronously and retry indefinitely until both succeed.`
      ],
      answer: [1, 3],
      explanation: `<b>B and D are correct.</b> A saga replaces a distributed transaction with a sequence of local transactions and compensations, which Step Functions orchestrates with retries and catch logic. The transactional outbox guarantees that events are emitted only for committed state changes.<br><b>A</b> two-phase commit is not supported across these managed databases and creates blocking, fragile coupling.<br><b>C</b> reverses the decomposition and recreates the monolith's coupling.<br><b>E</b> indefinite synchronous retries cause cascading failures and provide no way to undo partial work.`
    },
    {
      id: 'sap-087', domain: 'migrate', lesson: 'p-modernization-patterns', multi: false,
      question: `A company is moving 30 self-managed PostgreSQL 15 databases (50 GB to 2 TB each) from on-premises servers to Amazon Aurora PostgreSQL. Schemas, extensions and stored functions are compatible. The DBA team is small and wants a managed approach that performs the initial load and ongoing replication using PostgreSQL's native mechanisms, without provisioning or sizing replication instances, so that each cutover takes only minutes. Which approach should the solutions architect recommend?`,
      options: [
        `Use AWS DMS homogeneous data migrations with data providers for the source and target, running full load plus ongoing replication, and cut over each database when replication is caught up.`,
        `Convert each schema with AWS SCT and then run AWS DMS heterogeneous tasks on provisioned replication instances.`,
        `Rehost the database servers onto EC2 with AWS Application Migration Service and then manually configure Aurora replication.`,
        `Ship pg_dump files to AWS on Snowball Edge devices and restore them into Aurora.`
      ],
      answer: [0],
      explanation: `<b>A is correct.</b> DMS homogeneous data migrations are designed for like-to-like migrations, use the engine's native tools for full load and change replication, and run serverlessly, so the team does not manage replication instances and cutover requires only a short pause.<br><b>B</b> schema conversion is unnecessary for PostgreSQL to Aurora PostgreSQL, and provisioned instances add sizing work.<br><b>C</b> moves the servers to EC2, adding a second migration step with manual replication.<br><b>D</b> offline dumps have no ongoing replication, so cutover downtime would be long, and the databases are small enough for the network.`
    },
    {
      id: 'sap-088', domain: 'migrate', lesson: 'p-migration-strategy', multi: false,
      question: `A company has 2,500 VMs running on VMware vSphere with NSX networking in two data centers whose leases expire in 10 months. The infrastructure team has deep VMware expertise and runbooks built around vCenter, and the company wants to move quickly without re-platforming each VM or retraining operations staff, while gaining the ability to integrate with native AWS services over time. Which approach should the solutions architect recommend?`,
      options: [
        `Rehost every VM to Amazon EC2 with AWS Application Migration Service.`,
        `Refactor the applications into containers on Amazon EKS before the lease expires.`,
        `Export each VM with VM Import/Export and launch it as an EC2 instance.`,
        `Relocate the VMware environment to Amazon Elastic VMware Service (Amazon EVS) running in the company's VPC, and migrate the VMs with VMware HCX.`
      ],
      answer: [3],
      explanation: `<b>D is correct.</b> Relocating to Amazon EVS keeps vSphere, vCenter and NSX tooling and skills, moves VMs without converting them (for example with VMware HCX), and places the environment in the company's own VPC next to native AWS services.<br><b>A</b> is a valid rehost path but converts every VM to EC2 and changes operational tooling, which the company wants to avoid.<br><b>B</b> refactoring 2,500 VMs in 10 months is unrealistic.<br><b>C</b> VM Import is a per-VM, downtime-heavy process that also abandons the VMware operating model.`
    },
    {
      id: 'sap-089', domain: 'migrate', lesson: 'p-server-database-migration', multi: false,
      question: `A financial company is rehosting 400 servers with AWS Application Migration Service. Corporate policy states that replication data must never traverse the public internet and that replication servers must not have public IP addresses. The data center connects to the target VPC over AWS Direct Connect with a private VIF. What should the solutions architect configure?`,
      options: [
        `Use the default replication settings, which send data over the internet with TLS encryption.`,
        `Ship the server disks on Snowball Edge devices and use Application Migration Service only for the cutover.`,
        `Configure the replication settings template to use a private IP address for data replication with a staging area subnet reachable over Direct Connect, disable public IPs on replication servers, and create VPC interface endpoints for the Application Migration Service, EC2 and S3 (and related) endpoints so that agents and replication servers communicate privately.`,
        `Install a third-party VPN client on every source server that tunnels to the staging subnet over the internet.`
      ],
      answer: [2],
      explanation: `<b>C is correct.</b> Application Migration Service supports private connectivity: replication servers in the staging subnet receive data over private IPs through Direct Connect, and VPC endpoints keep agent and service API communication off the internet.<br><b>A</b> the default can use public IPs, violating the policy.<br><b>B</b> offline shipment breaks continuous block replication, so cutover would require long downtime.<br><b>D</b> still traverses the internet and adds a fleet of VPN clients to manage.`
    },
    {
      id: 'sap-090', domain: 'migrate', lesson: 'p-data-transfer', multi: true,
      question: `A media analytics company is migrating an on-premises Hadoop cluster that stores 800 TB in HDFS and runs nightly Spark jobs. A dedicated 10 Gbps Direct Connect connection is mostly idle, and the migration must finish within three months. After migration, the company wants to stop paying for idle cluster capacity during the day and keep the data durable independently of any cluster. Which actions should the solutions architect recommend? (Choose TWO.)`,
      options: [
        `Order an AWS Snowmobile to move the 800 TB.`,
        `Use AWS DataSync with an HDFS source location and an S3 destination over the Direct Connect connection, scheduling incremental transfers until cutover.`,
        `Deploy a Volume Gateway and copy HDFS data to iSCSI volumes.`,
        `Recreate HDFS on a long-running Amazon EMR cluster with large core nodes and copy the data into it.`,
        `Run the Spark jobs on transient Amazon EMR clusters (or EMR Serverless) that read and write data in Amazon S3, using Spot Instances for task nodes.`
      ],
      answer: [1, 4],
      explanation: `<b>B and E are correct.</b> At 10 Gbps the link can move roughly 100 TB per day at full utilization, so 800 TB fits comfortably within three months, and DataSync supports HDFS sources with verification and incremental runs. Storing data in S3 and running transient EMR clusters or EMR Serverless with Spot task nodes removes idle capacity and decouples durability from compute.<br><b>A</b> Snowmobile has been retired, and offline transfer is unnecessary with this bandwidth.<br><b>C</b> Volume Gateway provides block volumes for on-premises applications and does not suit an HDFS migration.<br><b>D</b> a long-running cluster with HDFS keeps paying for idle capacity and ties data durability to the cluster.`
    },
    {
      id: 'sap-091', domain: 'migrate', lesson: 'p-migration-strategy', multi: false,
      question: `A company is migrating 60 Microsoft SQL Server Enterprise servers to AWS. It owns licenses without Software Assurance mobility rights, licensed per physical core, and the license terms require visibility into physical sockets and cores. The company wants to bring these licenses, track usage to stay compliant, and prevent launches that would exceed the license count. What should the solutions architect recommend?`,
      options: [
        `Use Amazon RDS for SQL Server with the License Included model.`,
        `Launch the instances on EC2 Dedicated Hosts, and use AWS License Manager with license rules for core counts and host resource groups to manage host allocation and enforce limits.`,
        `Launch the instances on shared-tenancy EC2 and count vCPUs manually each month.`,
        `Use EC2 Dedicated Instances so that the hardware is not shared with other customers.`
      ],
      answer: [1],
      explanation: `<b>B is correct.</b> Dedicated Hosts expose physical sockets and cores for BYOL licenses that require them, and License Manager tracks consumption, enforces limits and can automate host allocation through host resource groups.<br><b>A</b> License Included means paying for new licenses rather than bringing existing ones.<br><b>C</b> shared tenancy does not give socket/core visibility, so the licenses cannot be used compliantly, and manual counting is error-prone.<br><b>D</b> Dedicated Instances isolate hardware but do not give visibility or control of physical sockets and cores.`
    },
    {
      id: 'sap-092', domain: 'migrate', lesson: 'p-modernization', multi: false,
      question: `A company runs 120 ASP.NET applications built on .NET Framework 4.x on Windows Server VMs. Windows licensing and patching costs are high. Leadership wants to move the applications to Linux containers on AWS to reduce cost, accepting code changes as long as the porting effort is largely automated and the team can review the changes. What should the solutions architect recommend?`,
      options: [
        `Rehost the VMs to EC2 Windows instances with AWS Application Migration Service and purchase Windows Savings Plans.`,
        `Replatform the applications to AWS Elastic Beanstalk on Windows Server.`,
        `Containerize the applications as Windows containers on Amazon ECS without code changes.`,
        `Use AWS Transform for .NET to analyze and port the applications from .NET Framework to cross-platform .NET, review and test the changes, then build Linux container images and run them on Amazon ECS on AWS Fargate.`
      ],
      answer: [3],
      explanation: `<b>D is correct.</b> AWS Transform for .NET automates much of the port from .NET Framework to cross-platform .NET, producing changes the team can review; the ported applications can then run in Linux containers on Fargate, removing Windows licensing and host patching.<br><b>A</b> keeps Windows licensing and VM management – a rehost, not the modernization requested.<br><b>B</b> still runs on Windows Server and keeps the licensing cost.<br><b>C</b> Windows containers keep Windows licensing and larger images; .NET Framework cannot run in Linux containers without porting.`
    }
  ]
};
