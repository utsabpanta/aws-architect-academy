window.TRACKS = window.TRACKS || {};
window.TRACKS.saa = {
  id: 'saa',
  code: 'SAA-C03',
  name: 'Solutions Architect – Associate',
  tagline: 'Learn to design secure, resilient, high-performing and cost-optimized architectures on AWS, the way the SAA-C03 exam asks you to.',
  exam: { questions: 65, minutes: 130, passing: 720, scale: '100–1000', cost: '150 USD', format: 'Multiple choice and multiple response' },
  domains: [
    {
      id: 'secure',
      name: 'Design Secure Architectures',
      weight: 30,
      summary: 'Control who can do what (IAM, Organizations, SCPs), protect data with encryption and secrets management, and build network and edge defenses with VPC controls, WAF, Shield and the threat-detection services.',
      lessons: [
        {
          id: 'iam-fundamentals',
          title: 'IAM Fundamentals & Policy Evaluation',
          minutes: 14,
          summary: 'Identities, policy types, how AWS decides allow vs deny, roles and STS, permission boundaries, and Cognito for application users.',
          sections: [
            {
              heading: 'Identities: root, users, groups and roles',
              html: `<p>IAM is global (not Regional) and answers one question for every API call: <strong>is this principal allowed to perform this action on this resource under these conditions?</strong></p>
<ul>
<li><strong>Root user</strong> – full, unrestrictable access to the account (within its own account). Use it only for the handful of tasks that require it, enable MFA, and never create access keys for it.</li>
<li><strong>IAM users</strong> – long-term credentials (password and/or access keys). Modern best practice is to minimize them in favor of federation through <strong>IAM Identity Center</strong>.</li>
<li><strong>Groups</strong> – a way to attach policies to many users. Groups cannot be nested and are not principals (you cannot reference a group in a resource policy).</li>
<li><strong>Roles</strong> – an identity with no long-term credentials. Something <em>assumes</em> the role and receives temporary credentials from <strong>STS</strong>. EC2 instances, Lambda functions, ECS tasks, federated users and other accounts all use roles.</li>
</ul>
<div class="callout">Rule of thumb for the exam: <strong>applications running on AWS never use access keys</strong>. EC2 uses an instance profile (a role), Lambda uses an execution role, ECS uses a task role.</div>`
            },
            {
              heading: 'Policy types at a glance',
              html: `<table>
<thead><tr><th>Policy type</th><th>Attached to</th><th>Grants permissions?</th><th>Typical use</th></tr></thead>
<tbody>
<tr><td>Identity-based</td><td>User, group, role</td><td>Yes</td><td>What this identity can do</td></tr>
<tr><td>Resource-based</td><td>S3 bucket, SQS queue, KMS key, Lambda function, etc.</td><td>Yes</td><td>Who can access this resource, including other accounts</td></tr>
<tr><td>Permission boundary</td><td>User or role</td><td>No (sets a maximum)</td><td>Delegating role creation safely</td></tr>
<tr><td>SCP / RCP (Organizations)</td><td>Root, OU or account</td><td>No (sets a maximum)</td><td>Guardrails across many accounts</td></tr>
<tr><td>Session policy</td><td>Passed during AssumeRole / federation</td><td>No (sets a maximum)</td><td>Further scoping a session</td></tr>
</tbody>
</table>
<p>A policy statement is built from <code>Effect</code>, <code>Action</code>, <code>Resource</code>, optional <code>Condition</code> and (for resource policies) <code>Principal</code>. Conditions such as <code>aws:SourceIp</code>, <code>aws:RequestedRegion</code>, <code>aws:PrincipalOrgID</code>, <code>aws:MultiFactorAuthPresent</code> and <code>aws:SecureTransport</code> show up often in exam answers.</p>`
            },
            {
              heading: 'How AWS evaluates a request',
              html: `<ol>
<li>Everything starts as an <strong>implicit deny</strong>.</li>
<li>Any <strong>explicit Deny</strong> in any applicable policy wins. Always. Nothing can override it.</li>
<li>If an SCP, RCP, permission boundary or session policy applies, the action must be allowed by <em>each</em> of them (they intersect).</li>
<li>Then an <strong>Allow</strong> is needed from an identity-based or resource-based policy.</li>
</ol>
<p>For <strong>cross-account</strong> access, both sides must agree: the caller's identity policy must allow the action <em>and</em> the resource policy (or the trust policy of a role) in the other account must allow the caller.</p>
<div class="callout warn">Trap: an administrator with <code>AdministratorAccess</code> who still gets AccessDenied in a member account is almost always being blocked by an <strong>SCP</strong> or an explicit deny somewhere, not by a missing identity policy.</div>`
            },
            {
              heading: 'Roles, STS and cross-account access',
              html: `<p>A role has two policies: a <strong>trust policy</strong> (who may assume it) and a <strong>permissions policy</strong> (what it can do). <code>sts:AssumeRole</code> returns temporary credentials that expire automatically.</p>
<ul>
<li><strong>Cross-account access</strong>: create a role in account B trusting account A; principals in A assume it. No shared keys.</li>
<li><strong>Third parties</strong>: require an <strong>external ID</strong> condition in the trust policy to prevent the confused-deputy problem.</li>
<li><strong>Federation</strong>: SAML 2.0 or OIDC identity providers (or IAM Identity Center) map corporate users to roles.</li>
<li><strong>IAM Access Analyzer</strong> finds resources shared outside your account or organization and can generate least-privilege policies from CloudTrail activity.</li>
</ul>`
            },
            {
              heading: 'Permission boundaries and least privilege',
              html: `<p>A <strong>permission boundary</strong> is a managed policy attached to a user or role that caps its maximum permissions. Effective permissions = identity policy ∩ boundary.</p>
<p><strong>Classic scenario:</strong> developers must be able to create IAM roles for their Lambda functions, but must not be able to create a role more powerful than themselves. Solution: allow <code>iam:CreateRole</code> only when the condition <code>iam:PermissionsBoundary</code> equals an approved boundary policy. Every role they create is capped, so privilege escalation is impossible.</p>
<div class="callout">Boundaries limit a single identity in one account. SCPs limit every identity in an account (including its root user). Neither grants anything on its own.</div>`
            },
            {
              heading: 'Application users: Amazon Cognito',
              html: `<table>
<thead><tr><th></th><th>Cognito user pools</th><th>Cognito identity pools</th></tr></thead>
<tbody>
<tr><td>Purpose</td><td>Authentication: sign-up, sign-in, MFA, social and SAML/OIDC federation</td><td>Authorization to AWS: exchange a token for temporary AWS credentials</td></tr>
<tr><td>Output</td><td>JWTs (ID, access, refresh tokens)</td><td>STS credentials mapped to IAM roles</td></tr>
<tr><td>Integrates with</td><td>ALB authentication, API Gateway authorizers</td><td>Direct calls to S3, DynamoDB and other services from the app</td></tr>
</tbody>
</table>
<p>Example: a mobile app lets users sign in with Google (user pool federation), then uses an identity pool to receive credentials scoped by an IAM policy variable so each user can only write to <code>s3://bucket/private/USER_ID/</code>.</p>`
            }
          ],
          keyPoints: [
            'Explicit deny always wins; otherwise you need an allow and no limiting policy (SCP, boundary, session) may exclude the action.',
            'Roles + STS give temporary credentials; use them for workloads, cross-account access and federation.',
            'Use an external ID when a third party assumes a role in your account.',
            'Permission boundaries cap what an identity can do and enable safe delegation of IAM administration.',
            'Cognito user pools authenticate users (JWTs); identity pools hand out temporary AWS credentials.',
            'Protect the root user with MFA and no access keys.'
          ],
          examTips: [
            'If the question says “an application on EC2 needs to access S3”, think IAM role via instance profile, never stored access keys.',
            'If the question says “third-party vendor needs access to our account”, think cross-account role with an external ID.',
            'If the question says “let developers create roles without escalating privileges”, think permission boundaries.',
            'If the question says “users sign in with social identity providers and upload directly to S3”, think Cognito user pool + identity pool.'
          ],
          services: ['IAM', 'STS', 'IAM Access Analyzer', 'IAM Identity Center', 'Amazon Cognito']
        },
        {
          id: 'governance-threat-detection',
          title: 'Multi-Account Governance & Threat Protection',
          minutes: 15,
          summary: 'AWS Organizations, SCPs, Control Tower and Identity Center, plus the detection and edge-protection services: GuardDuty, Macie, Inspector, Security Hub, WAF, Shield and Firewall Manager.',
          sections: [
            {
              heading: 'AWS Organizations and multi-account strategy',
              html: `<p>AWS recommends many accounts rather than one big one: accounts are the strongest isolation boundary for security, quotas and billing. <strong>AWS Organizations</strong> groups accounts into a hierarchy of <strong>organizational units (OUs)</strong> under a single <strong>management account</strong>.</p>
<ul>
<li><strong>Consolidated billing</strong>: one bill, and aggregated usage for volume discounts; RI and Savings Plans discounts can be shared across accounts.</li>
<li><strong>All features mode</strong> is required for SCPs and other policy types.</li>
<li>Integrates with many services for org-wide setup: CloudTrail organization trails, AWS Config aggregators, GuardDuty and Security Hub delegated administrators, AWS Backup policies, tag policies.</li>
<li><strong>AWS RAM</strong> (Resource Access Manager) shares resources such as subnets, Transit Gateways and Route 53 Resolver rules across accounts.</li>
</ul>`
            },
            {
              heading: 'Service control policies (SCPs)',
              html: `<p>An SCP defines the <strong>maximum available permissions</strong> for every principal in the accounts it applies to, including the member account's root user.</p>
<ul>
<li>SCPs <strong>never grant</strong> permissions; IAM policies still have to allow the action.</li>
<li>SCPs <strong>do not affect the management account</strong>, and do not affect service-linked roles.</li>
<li>Inheritance: an action must be allowed at every level from the root down to the account.</li>
<li>Common guardrails: deny leaving the organization, deny disabling CloudTrail/GuardDuty/Config, deny regions outside an allowed list (<code>aws:RequestedRegion</code>), require encryption.</li>
</ul>
<p><strong>Resource control policies (RCPs)</strong> are the newer counterpart: they cap what can be done <em>to resources</em> in your accounts (for example, deny access to S3 buckets from principals outside the organization), regardless of who calls.</p>
<div class="callout warn">Trap: “restrict the management account with an SCP” does not work. Keep workloads out of the management account.</div>`
            },
            {
              heading: 'Control Tower and IAM Identity Center',
              html: `<p><strong>AWS Control Tower</strong> automates a well-architected multi-account <em>landing zone</em>: it creates the organization structure, a log archive and audit account, account vending (Account Factory), and applies <strong>controls</strong> (guardrails) that are preventive (SCPs), detective (Config rules) or proactive (CloudFormation hooks).</p>
<p><strong>IAM Identity Center</strong> (successor to AWS SSO) provides one sign-in for all accounts and many SaaS apps. Users come from its built-in directory, Active Directory, or an external IdP such as Okta or Microsoft Entra ID. You assign <em>permission sets</em> to users per account, and Identity Center creates the roles for you.</p>
<div class="callout">“Quickly set up a governed multi-account environment following best practices” = Control Tower. “Single sign-on to many accounts with corporate identities” = IAM Identity Center.</div>`
            },
            {
              heading: 'Detection and audit services',
              html: `<table>
<thead><tr><th>Service</th><th>What it does</th><th>Exam keyword</th></tr></thead>
<tbody>
<tr><td>Amazon GuardDuty</td><td>Managed threat detection using ML on CloudTrail events, VPC Flow Logs and DNS logs, with optional protection for S3, EKS, RDS, Lambda, runtime and malware scanning. No agents needed for the core sources.</td><td>Compromised instance, crypto-mining, unusual API calls</td></tr>
<tr><td>Amazon Macie</td><td>Discovers sensitive data (PII, credentials, financial data) in S3 using ML and pattern matching</td><td>Find PII in S3 buckets</td></tr>
<tr><td>Amazon Inspector</td><td>Continuous vulnerability scanning of EC2 instances, ECR container images and Lambda functions</td><td>CVEs, unpatched software, network reachability</td></tr>
<tr><td>AWS Security Hub</td><td>Aggregates findings and runs security standards checks across accounts</td><td>Single pane of glass, compliance score</td></tr>
<tr><td>Amazon Detective</td><td>Investigates root cause using graph analysis of logs</td><td>Investigate a GuardDuty finding</td></tr>
<tr><td>AWS Config</td><td>Records resource configuration history and evaluates rules; can auto-remediate</td><td>Compliance over time, “who changed this security group”</td></tr>
<tr><td>AWS CloudTrail</td><td>Logs API calls (who did what, when, from where)</td><td>Audit trail of API activity</td></tr>
</tbody>
</table>
<p>Automated response pattern: GuardDuty or Security Hub finding → <strong>EventBridge rule</strong> → Lambda or Systems Manager Automation to isolate the instance, revoke keys, or notify via SNS.</p>`
            },
            {
              heading: 'Edge protection: WAF, Shield and Firewall Manager',
              html: `<table>
<thead><tr><th>Service</th><th>Layer</th><th>Protects against</th><th>Attach to</th></tr></thead>
<tbody>
<tr><td>AWS WAF</td><td>Layer 7</td><td>SQL injection, cross-site scripting, bad bots, IP or geo blocking, rate-based rules for HTTP floods</td><td>CloudFront, ALB, API Gateway, AppSync, Cognito user pools, App Runner, Verified Access</td></tr>
<tr><td>Shield Standard</td><td>Layers 3/4</td><td>Common network DDoS (SYN floods, reflection attacks)</td><td>Automatic and free for all customers</td></tr>
<tr><td>Shield Advanced</td><td>Layers 3/4/7</td><td>Larger and more sophisticated DDoS, with 24x7 Shield Response Team access, cost protection for scaling during attacks, and included WAF usage for protected resources</td><td>CloudFront, Route 53, Global Accelerator, ELB, Elastic IPs</td></tr>
<tr><td>Firewall Manager</td><td>Central management</td><td>Enforces WAF rules, Shield Advanced, security groups and Network Firewall policies across all accounts in an organization</td><td>Organizations</td></tr>
<tr><td>AWS Network Firewall</td><td>Layers 3–7 in the VPC</td><td>Stateful inspection, domain filtering, IDS/IPS for VPC traffic</td><td>VPC subnets</td></tr>
</tbody>
</table>
<div class="callout warn">Trap: Security groups cannot block a specific IP and WAF cannot be attached to an NLB. For L7 attacks on an NLB-fronted app, put CloudFront or an ALB with WAF in front.</div>`
            },
            {
              heading: 'Worked scenario',
              html: `<p>A company with 40 accounts wants to: prevent anyone from disabling CloudTrail, detect compromised instances, and find credit card numbers accidentally stored in S3. The design: an <strong>SCP</strong> on the root OU denying <code>cloudtrail:StopLogging</code> and <code>cloudtrail:DeleteTrail</code>; <strong>GuardDuty</strong> enabled organization-wide via a delegated administrator; <strong>Macie</strong> scanning S3 buckets; and <strong>Security Hub</strong> aggregating findings into one dashboard.</p>`
            }
          ],
          keyPoints: [
            'SCPs set maximum permissions for member accounts (including their root users) but never grant access and never affect the management account.',
            'Control Tower builds a governed landing zone; IAM Identity Center provides SSO across accounts.',
            'GuardDuty = threat detection, Macie = sensitive data in S3, Inspector = vulnerabilities, Security Hub = aggregation, Config = configuration compliance, CloudTrail = API audit.',
            'WAF handles layer 7 attacks; Shield Standard is free L3/L4 DDoS protection; Shield Advanced adds response team and cost protection.',
            'Firewall Manager centrally enforces WAF, Shield and security group policies across an organization.'
          ],
          examTips: [
            'If the question says “prevent all users in member accounts, including root, from doing X”, think SCP.',
            'If the question says “detect sensitive data / PII in S3”, think Macie (not GuardDuty).',
            'If the question says “SQL injection or XSS”, think AWS WAF on CloudFront, ALB or API Gateway.',
            'If the question says “DDoS protection with expert support and cost protection”, think Shield Advanced.',
            'If the question says “automatically respond to findings”, think EventBridge rule triggering Lambda or SSM Automation.'
          ],
          services: ['AWS Organizations', 'SCP', 'AWS Control Tower', 'IAM Identity Center', 'AWS RAM', 'Amazon GuardDuty', 'Amazon Macie', 'Amazon Inspector', 'AWS Security Hub', 'Amazon Detective', 'AWS Config', 'AWS CloudTrail', 'AWS WAF', 'AWS Shield', 'AWS Firewall Manager', 'AWS Network Firewall']
        },
        {
          id: 'data-protection',
          title: 'Encryption, KMS & Secrets Management',
          minutes: 13,
          summary: 'Encrypting data at rest and in transit with KMS, CloudHSM and ACM, choosing S3 encryption options, and storing credentials in Secrets Manager or Parameter Store.',
          sections: [
            {
              heading: 'AWS KMS essentials',
              html: `<p><strong>AWS KMS</strong> creates and controls encryption keys whose key material never leaves the service unencrypted. Every use of a key is logged in CloudTrail. Keys are <strong>Regional</strong> (multi-Region keys exist for cross-Region scenarios such as global tables or client-side encryption).</p>
<table>
<thead><tr><th>Key type</th><th>Who manages</th><th>Key policy control</th><th>Rotation</th></tr></thead>
<tbody>
<tr><td>AWS owned keys</td><td>AWS, shared across accounts</td><td>None, not visible</td><td>AWS</td></tr>
<tr><td>AWS managed keys (<code>aws/s3</code>, <code>aws/ebs</code>...)</td><td>AWS, in your account</td><td>View only</td><td>Automatic, yearly</td></tr>
<tr><td>Customer managed keys</td><td>You</td><td>Full: key policy, grants, enable/disable, schedule deletion</td><td>Optional automatic rotation, or manual</td></tr>
</tbody>
</table>
<p><strong>Envelope encryption</strong>: KMS generates a data key; the service encrypts your data with the data key locally and stores the data key encrypted under the KMS key. That is how EBS, S3 and RDS encrypt large data efficiently (KMS itself only encrypts small payloads directly, up to 4 KB).</p>
<div class="callout">Need to share encrypted data or snapshots with another account? You need a <strong>customer managed key</strong>, because only its key policy can be edited to grant the other account access. AWS managed keys cannot be shared.</div>`
            },
            {
              heading: 'Encryption options for S3 and other services',
              html: `<table>
<thead><tr><th>Option</th><th>Keys managed by</th><th>When to choose</th></tr></thead>
<tbody>
<tr><td>SSE-S3</td><td>S3 (AES-256)</td><td>Default for all new objects since January 2023; zero effort</td></tr>
<tr><td>SSE-KMS</td><td>KMS key (AWS managed or customer managed)</td><td>Need audit of key usage, separate key permissions, rotation control. Enable <strong>S3 Bucket Keys</strong> to cut KMS request costs.</td></tr>
<tr><td>DSSE-KMS</td><td>KMS, two layers</td><td>Compliance requiring dual-layer encryption</td></tr>
<tr><td>SSE-C</td><td>You supply the key with each request</td><td>You must keep keys outside AWS but want S3 to do the crypto</td></tr>
<tr><td>Client-side</td><td>You, before upload</td><td>Data must be encrypted before it ever reaches AWS</td></tr>
</tbody>
</table>
<p>Enforce encryption in transit with a bucket policy that denies requests where <code>aws:SecureTransport</code> is false. EBS encryption can be enabled by default per Region; an unencrypted EBS snapshot or RDS instance is encrypted by <strong>copying the snapshot with encryption enabled</strong> and restoring from it.</p>`
            },
            {
              heading: 'CloudHSM and ACM',
              html: `<p><strong>AWS CloudHSM</strong> gives you dedicated, single-tenant, FIPS-validated hardware security modules in your VPC. You manage the users and keys; AWS cannot access them. Choose it when a regulation requires exclusive control of the HSM, or for workloads like SSL offload, Oracle TDE, or custom key stores for KMS.</p>
<p><strong>AWS Certificate Manager (ACM)</strong> provisions free public TLS certificates and renews them automatically for integrated services: ELB, CloudFront, API Gateway, App Runner. ACM certificates are Regional; for <strong>CloudFront you must request or import the certificate in us-east-1</strong>. Public ACM certificates cannot be installed directly on EC2 instances (use them on a load balancer in front).</p>`
            },
            {
              heading: 'Secrets Manager vs Systems Manager Parameter Store',
              html: `<table>
<thead><tr><th></th><th>AWS Secrets Manager</th><th>SSM Parameter Store</th></tr></thead>
<tbody>
<tr><td>Built for</td><td>Secrets: database credentials, API keys</td><td>Configuration data and secrets (SecureString)</td></tr>
<tr><td>Automatic rotation</td><td><strong>Yes</strong>, built in for RDS, Aurora, Redshift, DocumentDB; Lambda for anything else</td><td>No native rotation (you build it yourself)</td></tr>
<tr><td>Cost</td><td>Per secret per month plus API calls</td><td>Standard tier free; advanced tier charged</td></tr>
<tr><td>Cross-Region replication</td><td>Yes</td><td>No</td></tr>
<tr><td>Cross-account sharing</td><td>Yes, via resource policy</td><td>Advanced parameters only, via RAM</td></tr>
<tr><td>Encryption</td><td>Always encrypted with KMS</td><td>SecureString uses KMS; String is plaintext</td></tr>
</tbody>
</table>
<div class="callout">“Rotate database credentials automatically” → <strong>Secrets Manager</strong>. “Store configuration values cheaply, some encrypted” → <strong>Parameter Store</strong>.</div>`
            },
            {
              heading: 'Worked scenario',
              html: `<p>A healthcare company stores patient files in S3 and must prove who used the encryption key, rotate it yearly, and share encrypted backups with a separate audit account. The design: <strong>SSE-KMS with a customer managed key</strong> (automatic rotation enabled, CloudTrail records every decrypt), a key policy granting the audit account's role <code>kms:Decrypt</code>, and S3 Bucket Keys to keep KMS request costs low. The application reads its database password from <strong>Secrets Manager</strong>, which rotates it every 30 days with no code changes.</p>`
            }
          ],
          keyPoints: [
            'KMS keys are Regional; customer managed keys give full control of key policies, rotation and cross-account sharing.',
            'Envelope encryption: data is encrypted with a data key, which is encrypted by the KMS key.',
            'SSE-S3 is the S3 default; SSE-KMS adds audit and access control; SSE-C means you supply keys.',
            'CloudHSM = single-tenant HSMs you control; KMS = managed multi-tenant service.',
            'ACM certificates for CloudFront must be in us-east-1.',
            'Secrets Manager rotates secrets automatically; Parameter Store is cheaper but has no native rotation.'
          ],
          examTips: [
            'If the question says “audit key usage and control who can use the key”, think SSE-KMS with a customer managed key.',
            'If the question says “share an encrypted snapshot with another account”, think customer managed KMS key plus updated key policy.',
            'If the question says “dedicated hardware, customer has exclusive control of keys”, think CloudHSM.',
            'If the question says “encrypt an existing unencrypted RDS database”, think snapshot, copy with encryption, restore.'
          ],
          services: ['AWS KMS', 'AWS CloudHSM', 'AWS Certificate Manager', 'AWS Secrets Manager', 'AWS Systems Manager Parameter Store', 'Amazon S3']
        },
        {
          id: 'vpc-networking',
          title: 'VPC Design, Endpoints & Hybrid Connectivity',
          minutes: 17,
          summary: 'Subnets, route tables, NAT, security groups vs NACLs, gateway vs interface endpoints, peering vs Transit Gateway, and Site-to-Site VPN vs Direct Connect.',
          sections: [
            {
              heading: 'Subnets, route tables, IGW and NAT',
              html: `<p>A <strong>VPC</strong> is Regional; each <strong>subnet</strong> lives in exactly one Availability Zone. AWS reserves 5 IP addresses in every subnet. Whether a subnet is “public” depends only on its <strong>route table</strong>:</p>
<ul>
<li><strong>Public subnet</strong>: route <code>0.0.0.0/0</code> → Internet Gateway (IGW). Instances also need a public or Elastic IP.</li>
<li><strong>Private subnet</strong>: no route to the IGW. Outbound internet goes via <code>0.0.0.0/0</code> → <strong>NAT gateway</strong> placed in a public subnet.</li>
</ul>
<p>A NAT gateway is a managed, auto-scaling service, but a standard NAT gateway lives in one AZ. For resilience deploy <strong>one NAT gateway per AZ</strong> and route each private subnet to the NAT gateway in its own AZ (this also avoids cross-AZ data charges). NAT instances are legacy; NAT gateways do not use security groups. For IPv6, use an <strong>egress-only internet gateway</strong> for outbound-only access.</p>`
            },
            {
              heading: 'Security groups vs network ACLs',
              html: `<table>
<thead><tr><th></th><th>Security group</th><th>Network ACL</th></tr></thead>
<tbody>
<tr><td>Applies to</td><td>Elastic network interface (instance level)</td><td>Subnet</td></tr>
<tr><td>State</td><td><strong>Stateful</strong>: return traffic automatically allowed</td><td><strong>Stateless</strong>: must allow return traffic (ephemeral ports 1024–65535)</td></tr>
<tr><td>Rules</td><td>Allow only</td><td>Allow and <strong>Deny</strong></td></tr>
<tr><td>Evaluation</td><td>All rules evaluated together</td><td>In number order, first match wins</td></tr>
<tr><td>References</td><td>Can reference other security groups</td><td>CIDR ranges only</td></tr>
</tbody>
</table>
<p>Use security-group referencing for tiers: the database SG allows port 3306 only from the app-tier SG, not from a CIDR. Use a NACL when you must <strong>explicitly block</strong> an IP address or range.</p>`
            },
            {
              heading: 'VPC endpoints: gateway vs interface',
              html: `<table>
<thead><tr><th></th><th>Gateway endpoint</th><th>Interface endpoint (PrivateLink)</th></tr></thead>
<tbody>
<tr><td>Services</td><td><strong>S3 and DynamoDB only</strong></td><td>Most AWS services (and S3), plus your own or partner services</td></tr>
<tr><td>How it works</td><td>Prefix-list route added to route tables</td><td>ENI with private IPs in your subnets; private DNS</td></tr>
<tr><td>Cost</td><td><strong>Free</strong></td><td>Hourly per AZ plus per-GB</td></tr>
<tr><td>Reachable from on-premises / peered VPCs</td><td>No</td><td>Yes</td></tr>
<tr><td>Security</td><td>Endpoint policy</td><td>Endpoint policy + security groups</td></tr>
</tbody>
</table>
<p>Private instances reaching S3 through a NAT gateway pay NAT data processing charges. A <strong>gateway endpoint</strong> removes that cost and keeps traffic on the AWS network. Bucket policies can then require <code>aws:SourceVpce</code> to allow access only through the endpoint.</p>
<p><strong>AWS PrivateLink</strong> also lets you expose your own service (behind an NLB) to hundreds of consumer VPCs or other accounts without peering, even when their CIDRs overlap.</p>`
            },
            {
              heading: 'Connecting VPCs: peering vs Transit Gateway',
              html: `<table>
<thead><tr><th></th><th>VPC peering</th><th>Transit Gateway</th></tr></thead>
<tbody>
<tr><td>Topology</td><td>One-to-one; full mesh needed for many VPCs</td><td>Hub and spoke</td></tr>
<tr><td>Transitive routing</td><td><strong>No</strong></td><td><strong>Yes</strong></td></tr>
<tr><td>Cross-account / cross-Region</td><td>Yes / yes</td><td>Yes (share via RAM) / yes (TGW peering)</td></tr>
<tr><td>Overlapping CIDRs</td><td>Not allowed</td><td>Not routable</td></tr>
<tr><td>Cost</td><td>No hourly charge; data transfer only</td><td>Per attachment-hour plus per-GB processing</td></tr>
<tr><td>On-premises</td><td>No</td><td>Attach VPN and Direct Connect (via DX gateway) centrally</td></tr>
</tbody>
</table>
<p>A few VPCs with simple needs → peering. Dozens of VPCs plus on-premises networks → Transit Gateway with route tables for segmentation.</p>`
            },
            {
              heading: 'Hybrid connectivity: VPN and Direct Connect',
              html: `<table>
<thead><tr><th></th><th>Site-to-Site VPN</th><th>AWS Direct Connect</th></tr></thead>
<tbody>
<tr><td>Path</td><td>IPsec over the public internet</td><td>Private dedicated circuit via a DX location</td></tr>
<tr><td>Setup time</td><td>Minutes to hours</td><td>Weeks or more</td></tr>
<tr><td>Performance</td><td>Variable; each tunnel has limited bandwidth</td><td>Consistent; dedicated 1, 10, 100 Gbps (or hosted connections at smaller speeds)</td></tr>
<tr><td>Encryption</td><td>Yes, IPsec</td><td><strong>Not encrypted by default</strong>: add MACsec (on supported dedicated connections) or run a VPN over DX</td></tr>
<tr><td>Redundancy</td><td>Two tunnels per connection</td><td>Use two connections at two DX locations for maximum resilience</td></tr>
</tbody>
</table>
<ul>
<li>A VPN terminates on a <strong>virtual private gateway</strong> (one VPC) or a <strong>Transit Gateway</strong> (many VPCs). The on-premises side is a <strong>customer gateway</strong>.</li>
<li>A <strong>Direct Connect gateway</strong> lets one DX connection reach VPCs in multiple Regions.</li>
<li>Common cost-effective resilience: <strong>Direct Connect primary + Site-to-Site VPN backup</strong>.</li>
<li><strong>AWS Client VPN</strong> is for individual users' laptops, not site-to-site.</li>
</ul>
<div class="callout warn">Trap: Direct Connect is never the answer when the requirement is “connectivity within days”. Use VPN first, then DX.</div>`
            },
            {
              heading: 'Worked scenario',
              html: `<p>A three-tier web app: an ALB in public subnets across two AZs, application instances in private subnets, Aurora in isolated database subnets. App instances download patches through a NAT gateway in each AZ, read from S3 through a free gateway endpoint, and call Secrets Manager through an interface endpoint. The database security group only accepts traffic from the app security group. The on-premises data center connects through Direct Connect with a VPN backup into a Transit Gateway shared with all workload accounts.</p>`
            }
          ],
          keyPoints: [
            'A subnet is public only if its route table points 0.0.0.0/0 at an internet gateway.',
            'Deploy one NAT gateway per AZ for high availability.',
            'Security groups are stateful allow-lists on ENIs; NACLs are stateless subnet filters with allow and deny rules.',
            'Gateway endpoints (S3, DynamoDB) are free route-table entries; interface endpoints are ENIs with hourly cost.',
            'VPC peering is non-transitive; Transit Gateway provides transitive hub-and-spoke routing.',
            'Direct Connect is private and consistent but not encrypted by default and slow to provision; VPN is fast to set up over the internet.'
          ],
          examTips: [
            'If the question says “block a specific IP address”, think network ACL deny rule.',
            'If the question says “private subnet access to S3 without internet or NAT costs”, think S3 gateway endpoint.',
            'If the question says “expose a service to many VPCs with overlapping CIDRs”, think PrivateLink endpoint service behind an NLB.',
            'If the question says “connect many VPCs and on-premises with transitive routing”, think Transit Gateway.',
            'If the question says “consistent network performance and private connection”, think Direct Connect; add VPN for encryption or as a backup.'
          ],
          services: ['Amazon VPC', 'NAT gateway', 'Internet gateway', 'Security groups', 'Network ACLs', 'VPC endpoints', 'AWS PrivateLink', 'VPC peering', 'AWS Transit Gateway', 'AWS Site-to-Site VPN', 'AWS Direct Connect', 'AWS Client VPN']
        }
      ]
    },
    {
      id: 'resilient',
      name: 'Design Resilient Architectures',
      weight: 26,
      summary: 'Build loosely coupled, fault-tolerant systems that survive instance, AZ and Region failures: decoupling with messaging, load balancing and Auto Scaling, highly available databases, and disaster recovery strategies.',
      lessons: [
        {
          id: 'decoupling',
          title: 'Decoupling with SQS, SNS, EventBridge & Kinesis',
          minutes: 14,
          summary: 'Choose the right messaging or streaming service so components can fail, scale and change independently.',
          sections: [
            {
              heading: 'Why decouple?',
              html: `<p>In a tightly coupled system, if the order service calls the invoice service synchronously and the invoice service is slow or down, orders fail. Put a queue between them and the order service just drops a message and moves on; the invoice service processes it when it can. Decoupling gives you <strong>buffering for spikes</strong>, <strong>independent scaling</strong>, and <strong>fault isolation</strong>.</p>
<table>
<thead><tr><th>Service</th><th>Model</th><th>Choose when</th></tr></thead>
<tbody>
<tr><td>Amazon SQS</td><td>Queue, pull, one consumer group per message</td><td>Buffer work between producers and workers</td></tr>
<tr><td>Amazon SNS</td><td>Pub/sub, push to many subscribers</td><td>Fan-out one event to many endpoints (SQS, Lambda, HTTP, email, SMS)</td></tr>
<tr><td>Amazon EventBridge</td><td>Event bus with content-based rules</td><td>Route events by content between AWS services, SaaS apps and your own apps; schedules</td></tr>
<tr><td>Kinesis Data Streams</td><td>Ordered, replayable stream with shards</td><td>Real-time streaming data, multiple consumers reading the same records, replay</td></tr>
<tr><td>Amazon MQ</td><td>Managed ActiveMQ / RabbitMQ</td><td>Migrating apps that use JMS, AMQP, MQTT, STOMP without rewriting</td></tr>
</tbody>
</table>`
            },
            {
              heading: 'Amazon SQS in depth',
              html: `<ul>
<li><strong>Standard queues</strong>: nearly unlimited throughput, at-least-once delivery, best-effort ordering. Consumers must be idempotent.</li>
<li><strong>FIFO queues</strong>: strict ordering within a <strong>message group ID</strong> and exactly-once processing via deduplication IDs. Lower throughput than standard (raised substantially with high-throughput mode). Queue name must end in <code>.fifo</code>.</li>
<li><strong>Visibility timeout</strong>: after a consumer receives a message it is hidden for this long (default 30 seconds, max 12 hours). If not deleted in time, it reappears and may be processed again. Set it longer than your processing time.</li>
<li><strong>Retention</strong>: 1 minute to 14 days (default 4 days).</li>
<li><strong>Long polling</strong> (wait time up to 20 seconds) reduces empty responses and cost.</li>
<li><strong>Dead-letter queue (DLQ)</strong>: after <code>maxReceiveCount</code> failed receives, the message moves aside for analysis, so a “poison pill” does not block processing forever.</li>
<li><strong>Delay queues</strong> postpone delivery up to 15 minutes.</li>
</ul>
<p>Scale workers with an Auto Scaling group using a target tracking policy on <strong>backlog per instance</strong> (queue depth ÷ instances), or let Lambda poll the queue automatically.</p>
<div class="callout">With Lambda consuming SQS, AWS recommends a queue visibility timeout of at least <strong>six times</strong> the function timeout, and a DLQ (redrive policy) on the source queue.</div>`
            },
            {
              heading: 'SNS fan-out and EventBridge routing',
              html: `<p><strong>Fan-out pattern</strong>: publish once to an SNS topic subscribed by several SQS queues. Each downstream system (shipping, analytics, email) gets its own durable copy and processes at its own pace. <strong>SNS message filtering</strong> lets each subscription receive only the messages it cares about. SNS FIFO topics pair with SQS FIFO queues when ordering matters.</p>
<p><strong>EventBridge</strong> is the choice when events come from AWS services (for example, “EC2 instance state change”, “GuardDuty finding”), from SaaS partners, or when you want rich content-based filtering, schema discovery, <strong>archive and replay</strong>, cross-account event buses, or cron-style schedules via <strong>EventBridge Scheduler</strong>. <strong>EventBridge Pipes</strong> connect a source (SQS, Kinesis, DynamoDB Streams) to a target with optional filtering and enrichment.</p>`
            },
            {
              heading: 'Kinesis for streaming data',
              html: `<table>
<thead><tr><th></th><th>Kinesis Data Streams</th><th>Amazon Data Firehose</th></tr></thead>
<tbody>
<tr><td>Purpose</td><td>Real-time stream you process with your own consumers</td><td>Load streaming data into destinations, fully managed</td></tr>
<tr><td>Latency</td><td>Real time (milliseconds)</td><td>Near real time (buffered)</td></tr>
<tr><td>Storage / replay</td><td>Retained 24 hours by default, up to 365 days; consumers can replay</td><td>No replay; delivers and forgets</td></tr>
<tr><td>Scaling</td><td>Shards (provisioned) or on-demand mode</td><td>Automatic</td></tr>
<tr><td>Destinations</td><td>Lambda, KCL apps, Managed Service for Apache Flink, Firehose</td><td>S3, Redshift, OpenSearch, Splunk, HTTP endpoints and others; can transform with Lambda and convert to Parquet</td></tr>
</tbody>
</table>
<p>Ordering in Kinesis is guaranteed per shard (records with the same partition key go to the same shard). Each provisioned shard supports 1 MB/s in and 2 MB/s out.</p>`
            },
            {
              heading: 'Worked scenario',
              html: `<p>An e-commerce site sees 20x traffic during flash sales and order processing falls over. Redesign: the web tier writes orders to an <strong>SQS queue</strong>; an Auto Scaling group of workers scales on queue backlog; failed messages go to a DLQ. When an order is processed, the worker publishes to an <strong>SNS topic</strong> that fans out to queues for the warehouse, loyalty points and email services. Clickstream data goes to <strong>Kinesis Data Streams</strong> for real-time recommendations and through <strong>Firehose</strong> into S3 for analytics.</p>`
            }
          ],
          keyPoints: [
            'SQS buffers work; SNS fans out; EventBridge routes events by content; Kinesis streams ordered, replayable data.',
            'SQS visibility timeout default 30 s, max 12 h; retention up to 14 days; long polling up to 20 s.',
            'FIFO queues give ordering per message group and exactly-once processing; standard queues are at-least-once.',
            'Use DLQs to isolate messages that repeatedly fail.',
            'SNS + SQS fan-out gives each consumer its own durable queue.',
            'Use Amazon MQ to migrate existing JMS/AMQP/MQTT apps without code changes.'
          ],
          examTips: [
            'If the question says “messages processed in order, no duplicates”, think SQS FIFO with message group IDs.',
            'If the question says “same message to multiple systems”, think SNS fan-out to multiple SQS queues.',
            'If the question says “real-time streaming, multiple consumers, replay”, think Kinesis Data Streams.',
            'If the question says “load streaming data into S3/Redshift with no code”, think Amazon Data Firehose.',
            'If the question says “messages processed twice”, think visibility timeout too short.'
          ],
          services: ['Amazon SQS', 'Amazon SNS', 'Amazon EventBridge', 'Amazon Kinesis Data Streams', 'Amazon Data Firehose', 'Amazon MQ']
        },
        {
          id: 'ha-compute-routing',
          title: 'Load Balancing, Auto Scaling & Route 53',
          minutes: 15,
          summary: 'Spread traffic across AZs with Elastic Load Balancing, replace and scale instances with Auto Scaling, and steer users with Route 53 routing policies.',
          sections: [
            {
              heading: 'Elastic Load Balancing types',
              html: `<table>
<thead><tr><th></th><th>Application LB</th><th>Network LB</th><th>Gateway LB</th></tr></thead>
<tbody>
<tr><td>Layer</td><td>7 (HTTP/HTTPS, gRPC, WebSockets)</td><td>4 (TCP, UDP, TLS)</td><td>3 (IP packets, GENEVE)</td></tr>
<tr><td>Routing</td><td>Path, host, header, query string, method</td><td>Port based</td><td>Sends traffic through appliances</td></tr>
<tr><td>Targets</td><td>Instances, IPs, Lambda, ECS</td><td>Instances, IPs, ALB</td><td>Firewall / IDS appliances</td></tr>
<tr><td>Standout features</td><td>WAF integration, user authentication (Cognito/OIDC), redirects, fixed responses</td><td>Static IP per AZ (Elastic IP support), extreme performance, low latency, preserves source IP, PrivateLink endpoint services</td><td>Transparent insertion of third-party virtual appliances</td></tr>
</tbody>
</table>
<p>All ELBs are Regional and span multiple AZs, run health checks, and integrate with ACM for TLS termination. <strong>Cross-zone load balancing</strong> spreads requests evenly across all targets in all AZs (on by default for ALB). <strong>Sticky sessions</strong> pin a client to a target, but storing session state externally (ElastiCache or DynamoDB) is the more resilient design.</p>`
            },
            {
              heading: 'EC2 Auto Scaling',
              html: `<p>An Auto Scaling group (ASG) keeps a desired number of instances between a minimum and maximum, spread across the AZs you choose, using a <strong>launch template</strong>. If an instance fails a health check, the ASG replaces it.</p>
<table>
<thead><tr><th>Policy</th><th>How it works</th><th>Best for</th></tr></thead>
<tbody>
<tr><td>Target tracking</td><td>Keep a metric at a target (e.g. average CPU 50%, ALB requests per target)</td><td>Most workloads; simplest</td></tr>
<tr><td>Step scaling</td><td>Add/remove different amounts based on alarm breach size</td><td>Fine-grained reactions</td></tr>
<tr><td>Simple scaling</td><td>One adjustment per alarm, then wait for the cooldown</td><td>Legacy</td></tr>
<tr><td>Scheduled</td><td>Change capacity at known times</td><td>Predictable events: “every weekday at 8 AM”</td></tr>
<tr><td>Predictive</td><td>ML forecast from history, scales ahead of demand</td><td>Recurring cyclical patterns</td></tr>
</tbody>
</table>
<ul>
<li>Set the ASG <strong>health check type to ELB</strong> so instances that fail application health checks (not just EC2 status checks) are replaced.</li>
<li><strong>Warm pools</strong> keep pre-initialized instances ready to cut scale-out time for apps with long boot times.</li>
<li><strong>Lifecycle hooks</strong> run custom actions (e.g. drain logs) during launch or termination.</li>
</ul>
<div class="callout warn">Trap: an ASG in a single AZ is not highly available. Always span at least two AZs.</div>`
            },
            {
              heading: 'Route 53 routing policies',
              html: `<table>
<thead><tr><th>Policy</th><th>Behavior</th><th>Use case</th></tr></thead>
<tbody>
<tr><td>Simple</td><td>Returns the configured value(s); no health checks</td><td>Single resource</td></tr>
<tr><td>Weighted</td><td>Splits traffic by percentage</td><td>Blue/green, canary releases, A/B tests</td></tr>
<tr><td>Latency-based</td><td>Routes to the Region with lowest latency for the user</td><td>Multi-Region performance</td></tr>
<tr><td>Failover</td><td>Primary/secondary using health checks</td><td>Active-passive DR</td></tr>
<tr><td>Geolocation</td><td>By user's continent, country or US state</td><td>Compliance, localized content, restrict by country</td></tr>
<tr><td>Geoproximity</td><td>By distance, with a bias to grow/shrink regions</td><td>Shift traffic between Regions gradually</td></tr>
<tr><td>Multivalue answer</td><td>Returns up to 8 healthy records at random</td><td>Simple client-side load spreading (not a load balancer)</td></tr>
<tr><td>IP-based</td><td>By the client's source CIDR</td><td>Route specific ISPs or networks</td></tr>
</tbody>
</table>
<p><strong>Alias records</strong> point to AWS resources (ELB, CloudFront, S3 website, API Gateway, another record), work at the <strong>zone apex</strong> (example.com) where CNAMEs cannot, and alias queries to AWS resources are free.</p>`
            },
            {
              heading: 'Worked scenario',
              html: `<p>A media company runs in us-east-1 and wants automatic failover to eu-west-1 if the primary Region fails. Each Region has an ALB in front of an ASG spanning three AZs. Route 53 has a <strong>failover</strong> record pair: primary alias to the us-east-1 ALB with a health check, secondary alias to the eu-west-1 ALB. If the health check fails, DNS answers switch to Europe. Within each Region, the ASG uses <strong>target tracking</strong> on ALB request count per target and <strong>ELB health checks</strong>.</p>`
            }
          ],
          keyPoints: [
            'ALB = layer 7 smart routing; NLB = layer 4, static IPs, ultra-low latency; GWLB = inline security appliances.',
            'Auto Scaling groups replace unhealthy instances and scale across multiple AZs.',
            'Target tracking is the default choice; scheduled for known events; predictive for recurring patterns.',
            'Use ELB health checks in the ASG so app-level failures trigger replacement.',
            'Route 53 failover = active-passive; latency = performance; geolocation = by user location; weighted = traffic splitting.',
            'Alias records work at the zone apex and are free for AWS targets.'
          ],
          examTips: [
            'If the question says “route by URL path or hostname”, think ALB listener rules.',
            'If the question says “static IP for whitelisting” or “millions of requests per second, TCP/UDP”, think NLB (or Global Accelerator for global static IPs).',
            'If the question says “traffic spikes every Monday morning”, think scheduled scaling (or predictive).',
            'If the question says “serve content in the local language / restrict by country”, think geolocation routing.',
            'If the question says “gradually shift 10% of traffic to the new version”, think weighted routing.'
          ],
          services: ['Elastic Load Balancing', 'Application Load Balancer', 'Network Load Balancer', 'Gateway Load Balancer', 'Amazon EC2 Auto Scaling', 'Amazon Route 53']
        },
        {
          id: 'ha-databases',
          title: 'Highly Available Databases',
          minutes: 14,
          summary: 'RDS Multi-AZ vs read replicas, Aurora architecture and Global Database, DynamoDB global tables and backups.',
          sections: [
            {
              heading: 'RDS Multi-AZ vs read replicas',
              html: `<table>
<thead><tr><th></th><th>Multi-AZ (instance deployment)</th><th>Multi-AZ DB cluster</th><th>Read replicas</th></tr></thead>
<tbody>
<tr><td>Main goal</td><td><strong>High availability</strong></td><td>HA + readable standbys</td><td><strong>Read scaling</strong> (and DR)</td></tr>
<tr><td>Replication</td><td>Synchronous to one standby in another AZ</td><td>To two readable standbys in different AZs</td><td>Asynchronous</td></tr>
<tr><td>Standby readable?</td><td>No</td><td>Yes</td><td>Yes</td></tr>
<tr><td>Failover</td><td>Automatic, DNS endpoint stays the same (typically 1–2 minutes)</td><td>Automatic, typically faster</td><td>Manual promotion; becomes standalone DB</td></tr>
<tr><td>Cross-Region</td><td>No</td><td>No</td><td>Yes</td></tr>
</tbody>
</table>
<p>RDS supports up to 15 read replicas for MySQL, MariaDB and PostgreSQL. Applications must send reads to the replica endpoint themselves. A read replica can itself be Multi-AZ. <strong>RDS Proxy</strong> pools connections (great for Lambda) and reduces failover time.</p>
<div class="callout warn">Trap: Multi-AZ does not improve read performance for the standard instance deployment, because the standby serves no traffic. For “reporting queries slow down the production database”, the answer is a read replica.</div>`
            },
            {
              heading: 'Amazon Aurora',
              html: `<p>Aurora (MySQL- and PostgreSQL-compatible) separates compute from a distributed storage layer that keeps <strong>six copies of data across three AZs</strong> and self-heals. Storage grows automatically.</p>
<ul>
<li><strong>Up to 15 Aurora Replicas</strong> share the same storage, so replica lag is typically very low and any replica can be promoted on failover, typically in well under a minute.</li>
<li><strong>Endpoints</strong>: a writer (cluster) endpoint, a reader endpoint that load-balances across replicas, and optional custom endpoints.</li>
<li><strong>Aurora Serverless v2</strong> scales capacity in fine increments for variable or unpredictable workloads.</li>
<li><strong>Aurora Global Database</strong>: one primary Region and up to several read-only secondary Regions with storage-based replication, typically under a second of lag. A secondary can be promoted in about a minute: low RPO and RTO for cross-Region DR, and low-latency local reads worldwide.</li>
<li><strong>Backtrack</strong> (Aurora MySQL) rewinds the database to a point in time without restoring a backup; <strong>cloning</strong> creates a fast copy-on-write copy for testing.</li>
</ul>`
            },
            {
              heading: 'DynamoDB resilience features',
              html: `<ul>
<li>Data is automatically replicated across three AZs in a Region.</li>
<li><strong>Global tables</strong>: multi-Region, <strong>multi-active</strong> replication; applications can read and write in any replica Region. Ideal for globally distributed apps that need local write latency and Region-level resilience.</li>
<li><strong>Point-in-time recovery (PITR)</strong>: continuous backups, restore to any second in the retention window (up to 35 days).</li>
<li><strong>On-demand backups</strong> and AWS Backup integration for long-term retention and cross-account/cross-Region copies.</li>
<li><strong>DynamoDB Streams</strong> capture item changes for event-driven processing (e.g. trigger Lambda).</li>
<li><strong>Capacity modes</strong>: on-demand (pay per request, no planning) or provisioned (with auto scaling, cheaper for steady traffic).</li>
</ul>`
            },
            {
              heading: 'Backups and recovery for RDS',
              html: `<p><strong>Automated backups</strong> enable point-in-time restore within a retention period of up to 35 days. <strong>Manual snapshots</strong> persist until you delete them and can be copied across Regions and shared across accounts. A restore always creates a <strong>new</strong> DB instance with a new endpoint. For centralized policies across services and accounts, use <strong>AWS Backup</strong>.</p>`
            },
            {
              heading: 'Worked scenario',
              html: `<p>A fintech app on RDS for PostgreSQL needs to survive an AZ outage without data loss, and month-end reports are slowing transactions. Solution: enable <strong>Multi-AZ</strong> for synchronous standby and automatic failover, and add a <strong>read replica</strong> for the reporting tool. Later, for a global expansion requiring cross-Region DR with an RPO of seconds, they migrate to <strong>Aurora PostgreSQL with Global Database</strong>.</p>`
            }
          ],
          keyPoints: [
            'Multi-AZ = HA with synchronous replication and automatic failover; read replicas = asynchronous read scaling and cross-Region DR.',
            'Aurora stores 6 copies across 3 AZs and supports up to 15 low-lag replicas with fast failover.',
            'Aurora Global Database gives cross-Region replication with roughly one-second lag and fast promotion.',
            'DynamoDB global tables are multi-active across Regions.',
            'RDS automated backups allow point-in-time restore (up to 35 days); restores create a new instance.',
            'RDS Proxy pools connections and improves failover handling, especially for Lambda.'
          ],
          examTips: [
            'If the question says “automatic failover, no data loss, AZ failure”, think RDS Multi-AZ.',
            'If the question says “offload read traffic / reporting”, think read replicas (or Aurora reader endpoint).',
            'If the question says “cross-Region DR with RPO of about a second and RTO of about a minute for a relational DB”, think Aurora Global Database.',
            'If the question says “users in multiple Regions write to the same table with low latency”, think DynamoDB global tables.',
            'If the question says “Lambda exhausting database connections”, think RDS Proxy.'
          ],
          services: ['Amazon RDS', 'Amazon Aurora', 'Aurora Global Database', 'Aurora Serverless v2', 'Amazon DynamoDB', 'RDS Proxy', 'AWS Backup']
        },
        {
          id: 'disaster-recovery',
          title: 'Disaster Recovery Strategies & Backup',
          minutes: 12,
          summary: 'RTO and RPO, the four DR strategies from backup and restore to multi-site active/active, and the AWS services that implement them.',
          sections: [
            {
              heading: 'RTO and RPO',
              html: `<p><strong>Recovery Point Objective (RPO)</strong>: how much data loss is acceptable, measured in time. An RPO of 1 hour means you can lose at most the last hour of data, so you need backups or replication at least hourly.</p>
<p><strong>Recovery Time Objective (RTO)</strong>: how long the business can be down before service is restored.</p>
<p>Lower RTO and RPO cost more. The exam gives you numbers and asks for the <em>cheapest</em> strategy that still meets them.</p>`
            },
            {
              heading: 'The four DR strategies',
              html: `<table>
<thead><tr><th>Strategy</th><th>What runs in the DR Region</th><th>Typical RTO / RPO</th><th>Cost</th></tr></thead>
<tbody>
<tr><td><strong>Backup and restore</strong></td><td>Nothing; only backups (snapshots, S3 copies, AMIs)</td><td>Hours / hours</td><td>$ lowest</td></tr>
<tr><td><strong>Pilot light</strong></td><td>Core data is live and replicated (e.g. database replica); app servers are off or not yet created, ready to launch from AMIs/IaC</td><td>Tens of minutes / minutes</td><td>$$</td></tr>
<tr><td><strong>Warm standby</strong></td><td>A full but <strong>scaled-down</strong> copy of the environment is always running and can take traffic; scale up on failover</td><td>Minutes / seconds to minutes</td><td>$$$</td></tr>
<tr><td><strong>Multi-site active/active</strong></td><td>Full production capacity in two or more Regions serving traffic simultaneously</td><td>Near zero / near zero</td><td>$$$$ highest</td></tr>
</tbody>
</table>
<div class="callout">Distinguishing pilot light from warm standby: in pilot light, the app tier is <strong>not running</strong> (only data replication). In warm standby, the whole stack <strong>is running</strong>, just smaller.</div>`
            },
            {
              heading: 'Services that implement DR',
              html: `<ul>
<li><strong>AWS Backup</strong>: centralized, policy-based backups for EC2, EBS, RDS, Aurora, DynamoDB, EFS, FSx, S3 and more, with cross-Region and cross-account copies. <strong>Backup Vault Lock</strong> makes backups immutable (WORM) against ransomware or rogue admins.</li>
<li><strong>AWS Elastic Disaster Recovery (DRS)</strong>: continuous block-level replication of on-premises or cloud servers into a low-cost staging area; launches recovered instances in minutes, with RPO in seconds.</li>
<li><strong>Data replication</strong>: S3 Cross-Region Replication, Aurora Global Database, DynamoDB global tables, RDS cross-Region read replicas, EBS snapshot copies.</li>
<li><strong>Infrastructure as code</strong>: CloudFormation or Terraform templates to recreate the environment quickly in the DR Region.</li>
<li><strong>Traffic switching</strong>: Route 53 failover routing with health checks, or Global Accelerator for faster failover without DNS caching delays.</li>
</ul>`
            },
            {
              heading: 'Worked scenario',
              html: `<p>An insurance company requires RTO 4 hours and RPO 1 hour for its claims system at the lowest possible cost. Running anything idle in a second Region is not justified. Backups alone with hourly frequency meet the RPO, and IaC can rebuild the stack within 4 hours. Choose <strong>backup and restore</strong>: AWS Backup plans with hourly RDS snapshots and cross-Region copy, AMIs copied to the DR Region, and CloudFormation templates. If the RTO dropped to 15 minutes, they would move to <strong>pilot light</strong> or <strong>warm standby</strong>.</p>`
            }
          ],
          keyPoints: [
            'RPO = acceptable data loss; RTO = acceptable downtime.',
            'Backup and restore (cheapest, hours) → pilot light (data live, compute off) → warm standby (scaled-down stack running) → multi-site active/active (near-zero, most expensive).',
            'AWS Backup centralizes backups with cross-Region/cross-account copies; Vault Lock makes them immutable.',
            'Elastic Disaster Recovery continuously replicates servers for fast, low-RPO recovery.',
            'Route 53 failover or Global Accelerator redirects users to the recovery Region.'
          ],
          examTips: [
            'If the question says “lowest cost DR, RTO/RPO in hours”, think backup and restore.',
            'If the question says “database replicated, servers launched only during disaster”, think pilot light.',
            'If the question says “scaled-down but fully functional copy always running”, think warm standby.',
            'If the question says “zero downtime, users served from multiple Regions”, think multi-site active/active.'
          ],
          services: ['AWS Backup', 'AWS Elastic Disaster Recovery', 'Amazon Route 53', 'AWS CloudFormation', 'Amazon S3 Replication', 'Aurora Global Database']
        }
      ]
    },
    {
      id: 'performance',
      name: 'Design High-Performing Architectures',
      weight: 24,
      summary: 'Pick storage, compute, database, caching and networking services that meet throughput and latency needs and scale elastically.',
      lessons: [
        {
          id: 'storage-performance',
          title: 'Block, File & Hybrid Storage',
          minutes: 15,
          summary: 'EBS volume types and instance store, EFS, the FSx family, Storage Gateway, and S3 performance techniques.',
          sections: [
            {
              heading: 'Block storage: EBS and instance store',
              html: `<p>An <strong>EBS volume</strong> is network-attached block storage that lives in <strong>one AZ</strong> and persists independently of the instance. To move it to another AZ, snapshot it (snapshots are stored in S3, incremental) and restore the snapshot in the new AZ.</p>
<table>
<thead><tr><th>Type</th><th>Class</th><th>Key facts</th><th>Use for</th></tr></thead>
<tbody>
<tr><td>gp3</td><td>General purpose SSD</td><td>Baseline 3,000 IOPS and 125 MB/s regardless of size; IOPS and throughput can be provisioned independently of capacity</td><td>Boot volumes, most workloads (default choice)</td></tr>
<tr><td>gp2</td><td>General purpose SSD (older)</td><td>IOPS scale with size (3 IOPS per GB) with burst credits</td><td>Legacy; migrate to gp3 to save cost</td></tr>
<tr><td>io2 Block Express / io1</td><td>Provisioned IOPS SSD</td><td>Highest IOPS and lowest latency, sub-millisecond; io2 Block Express reaches 256,000 IOPS; supports <strong>Multi-Attach</strong></td><td>Mission-critical databases needing sustained IOPS</td></tr>
<tr><td>st1</td><td>Throughput optimized HDD</td><td>High sequential throughput, cannot be a boot volume</td><td>Big data, log processing, data warehouses</td></tr>
<tr><td>sc1</td><td>Cold HDD</td><td>Lowest cost, cannot be a boot volume</td><td>Infrequently accessed data</td></tr>
</tbody>
</table>
<p><strong>Instance store</strong> is physically attached to the host: extremely high IOPS and very low latency, but <strong>ephemeral</strong>; data is lost when the instance stops, terminates or the host fails. Great for caches, buffers and scratch data, or for databases that replicate across nodes themselves.</p>`
            },
            {
              heading: 'File storage: EFS and FSx',
              html: `<table>
<thead><tr><th>Service</th><th>Protocol / OS</th><th>Choose when</th></tr></thead>
<tbody>
<tr><td>Amazon EFS</td><td>NFS, Linux</td><td>Shared, elastic POSIX file system for many Linux instances, containers and Lambda across AZs. Storage classes Standard, Infrequent Access and Archive with lifecycle management; One Zone option for lower cost. Throughput modes: Elastic (recommended for spiky), Provisioned, Bursting.</td></tr>
<tr><td>FSx for Windows File Server</td><td>SMB, Windows, Active Directory</td><td>Windows file shares, NTFS ACLs, DFS namespaces, Multi-AZ option</td></tr>
<tr><td>FSx for Lustre</td><td>Lustre, Linux</td><td>HPC, ML training, media rendering; hundreds of GB/s; <strong>links to an S3 bucket</strong> to lazy-load and write back data. Scratch (temporary, cheaper) or persistent deployment types.</td></tr>
<tr><td>FSx for NetApp ONTAP</td><td>NFS, SMB and iSCSI</td><td>Migrating NetApp workloads, multi-protocol access, snapshots, cloning, compression and deduplication</td></tr>
<tr><td>FSx for OpenZFS</td><td>NFS</td><td>Migrating ZFS or Linux file servers needing very low latency and snapshots</td></tr>
</tbody>
</table>
<div class="callout warn">Trap: EFS is Linux/NFS only. A Windows workload needing a shared drive is FSx for Windows File Server.</div>`
            },
            {
              heading: 'Hybrid storage: AWS Storage Gateway',
              html: `<p>Storage Gateway runs as a VM or hardware appliance on-premises and presents AWS storage through standard protocols, with a local cache for low-latency access.</p>
<table>
<thead><tr><th>Gateway type</th><th>Presents</th><th>Backed by</th><th>Use case</th></tr></thead>
<tbody>
<tr><td>S3 File Gateway</td><td>NFS / SMB file shares</td><td>Objects in S3 (one file = one object)</td><td>On-prem apps write files that land in S3 for analytics, backup, archiving</td></tr>
<tr><td>Volume Gateway – cached</td><td>iSCSI block volumes</td><td>S3, with frequently used data cached locally</td><td>Extend on-prem block storage into AWS</td></tr>
<tr><td>Volume Gateway – stored</td><td>iSCSI block volumes</td><td>Full copy on-premises, asynchronously backed up to S3 as EBS snapshots</td><td>Low-latency local access to the full dataset, with cloud backup</td></tr>
<tr><td>Tape Gateway</td><td>Virtual tape library (iSCSI VTL)</td><td>S3 and S3 Glacier tiers</td><td>Replace physical tapes without changing backup software</td></tr>
</tbody>
</table>`
            },
            {
              heading: 'S3 performance',
              html: `<ul>
<li>S3 scales to at least <strong>3,500 PUT/COPY/POST/DELETE and 5,500 GET/HEAD requests per second per prefix</strong>. Spread keys across more prefixes to parallelize.</li>
<li><strong>Multipart upload</strong>: recommended above 100 MB and required above 5 GB (single PUT limit). Maximum object size is 5 TB. Parts upload in parallel and can be retried independently.</li>
<li><strong>Byte-range fetches</strong> parallelize downloads and can retrieve only part of an object.</li>
<li><strong>S3 Transfer Acceleration</strong>: clients upload to the nearest edge location, then data travels over the AWS backbone to the bucket. Use it for long-distance uploads to a single bucket.</li>
<li>S3 provides <strong>strong read-after-write consistency</strong> for all operations.</li>
<li><strong>S3 Express One Zone</strong>: a high-performance single-AZ storage class with single-digit millisecond latency, for latency-sensitive analytics and ML.</li>
</ul>`
            },
            {
              heading: 'Worked scenario',
              html: `<p>A genomics lab keeps 200 TB of raw data in S3 and runs short-lived HPC jobs that need hundreds of GB/s of throughput. Copying data to EBS for each job is slow. Solution: an <strong>FSx for Lustre scratch</strong> file system linked to the S3 bucket; jobs read data lazily from S3 at Lustre speed and write results back to S3, and the file system is deleted after the run. Their Windows-based lab instruments write to <strong>FSx for Windows File Server</strong>, and the legacy on-prem tape backups move to <strong>Tape Gateway</strong>.</p>`
            }
          ],
          keyPoints: [
            'EBS volumes are AZ-scoped; move them with snapshots. gp3 gives 3,000 IOPS and 125 MB/s baseline, tunable independently.',
            'io2 Block Express for the highest sustained IOPS; st1/sc1 HDDs cannot be boot volumes.',
            'Instance store is fastest but ephemeral.',
            'EFS = shared NFS for Linux across AZs; FSx for Windows = SMB + AD; FSx for Lustre = HPC with S3 integration; FSx for ONTAP = multi-protocol NetApp.',
            'Storage Gateway: S3 File (NFS/SMB to S3), Volume (iSCSI cached/stored), Tape (VTL).',
            'S3: 3,500 writes and 5,500 reads per second per prefix; multipart above 100 MB; Transfer Acceleration for long-distance uploads.'
          ],
          examTips: [
            'If the question says “shared file system for hundreds of Linux instances across AZs”, think EFS.',
            'If the question says “Windows, SMB, Active Directory”, think FSx for Windows File Server.',
            'If the question says “HPC” or “ML training with data in S3, highest throughput”, think FSx for Lustre.',
            'If the question says “replace tape backups without changing software”, think Tape Gateway.',
            'If the question says “temporary data, highest IOPS, loss is acceptable”, think instance store.'
          ],
          services: ['Amazon EBS', 'EC2 instance store', 'Amazon EFS', 'Amazon FSx for Windows File Server', 'Amazon FSx for Lustre', 'Amazon FSx for NetApp ONTAP', 'Amazon FSx for OpenZFS', 'AWS Storage Gateway', 'Amazon S3', 'S3 Transfer Acceleration']
        },
        {
          id: 'caching-edge',
          title: 'Caching & Edge Networking',
          minutes: 13,
          summary: 'Reduce latency and offload backends with CloudFront, Global Accelerator, ElastiCache and DAX.',
          sections: [
            {
              heading: 'Amazon CloudFront',
              html: `<p>CloudFront is a CDN with hundreds of edge locations. It caches static content near users and also accelerates <strong>dynamic</strong> content by keeping persistent connections to the origin over the AWS backbone.</p>
<ul>
<li><strong>Origins</strong>: S3 buckets, ALBs, EC2, API Gateway, MediaStore, any HTTP server. <strong>Origin groups</strong> provide origin failover.</li>
<li><strong>Origin Access Control (OAC)</strong>: the bucket stays private and only the CloudFront distribution can read it (OAC replaces the legacy Origin Access Identity).</li>
<li><strong>Signed URLs / signed cookies</strong>: restrict access to premium content (signed URL for one file, cookies for many).</li>
<li><strong>Cache behaviors and policies</strong>: different TTLs per path; control which headers, cookies and query strings are part of the cache key (fewer = higher hit ratio).</li>
<li><strong>Geo restriction</strong>, AWS WAF integration, Shield Standard included, HTTPS with ACM certificates (from us-east-1).</li>
<li><strong>CloudFront Functions</strong> (lightweight JavaScript, viewer request/response, header rewrites, URL redirects) vs <strong>Lambda@Edge</strong> (Node.js/Python, longer execution, can call network, origin events).</li>
</ul>`
            },
            {
              heading: 'CloudFront vs Global Accelerator',
              html: `<table>
<thead><tr><th></th><th>CloudFront</th><th>Global Accelerator</th></tr></thead>
<tbody>
<tr><td>Protocols</td><td>HTTP/HTTPS (and WebSockets)</td><td>TCP and UDP (any app)</td></tr>
<tr><td>Caching</td><td>Yes</td><td>No; proxies packets to Regional endpoints</td></tr>
<tr><td>Entry point</td><td>DNS name for the distribution</td><td><strong>Two static anycast IP addresses</strong></td></tr>
<tr><td>Failover</td><td>Origin failover per request</td><td>Health-check-based failover between Regions in seconds, no DNS caching issues</td></tr>
<tr><td>Endpoints</td><td>Origins</td><td>ALB, NLB, EC2, Elastic IPs</td></tr>
<tr><td>Typical use</td><td>Websites, APIs, video, static assets</td><td>Gaming, VoIP, IoT, apps needing fixed IPs for allow-listing, fast multi-Region failover</td></tr>
</tbody>
</table>`
            },
            {
              heading: 'Amazon ElastiCache',
              html: `<p>ElastiCache provides managed in-memory caches with sub-millisecond latency. It reduces database load for read-heavy workloads and stores <strong>session state</strong> so web servers can be stateless.</p>
<table>
<thead><tr><th></th><th>Valkey / Redis OSS</th><th>Memcached</th></tr></thead>
<tbody>
<tr><td>Data structures</td><td>Rich: strings, hashes, lists, sets, <strong>sorted sets</strong>, streams, geospatial</td><td>Simple key-value</td></tr>
<tr><td>Replication / Multi-AZ failover</td><td>Yes</td><td>No</td></tr>
<tr><td>Persistence / backups</td><td>Yes (snapshots)</td><td>No</td></tr>
<tr><td>Threading</td><td>Mostly single-threaded per shard; scale with cluster mode sharding</td><td>Multi-threaded</td></tr>
<tr><td>Use for</td><td>Leaderboards, sessions, pub/sub, anything needing HA</td><td>Simple, horizontally scaled cache where losing data is fine</td></tr>
</tbody>
</table>
<p>Caching strategies: <strong>lazy loading (cache-aside)</strong> loads data on a cache miss and can serve stale data, so pair it with a TTL; <strong>write-through</strong> updates the cache on every DB write, keeping it fresh at the cost of extra writes.</p>`
            },
            {
              heading: 'DynamoDB Accelerator (DAX)',
              html: `<p>DAX is an in-memory cache built specifically for DynamoDB, API-compatible so applications need minimal code changes. It cuts read latency from single-digit milliseconds to <strong>microseconds</strong> for eventually consistent reads and absorbs hot keys. DAX does not help write-heavy workloads or strongly consistent reads. Use ElastiCache instead when you need to cache computed results or data from other sources.</p>`
            },
            {
              heading: 'Worked scenario',
              html: `<p>A sports app has a global audience. Static assets and the video highlights are served through <strong>CloudFront</strong> with OAC on the S3 origin. The live score API on ALB is also behind CloudFront with a 1-second TTL. A real-time multiplayer quiz uses UDP and needs fixed IPs for partner firewalls, so it uses <strong>Global Accelerator</strong> in front of NLBs in two Regions. Leaderboards use <strong>ElastiCache for Valkey</strong> sorted sets, and user profile lookups in DynamoDB go through <strong>DAX</strong>.</p>`
            }
          ],
          keyPoints: [
            'CloudFront caches and accelerates HTTP(S) content at the edge; use OAC to keep S3 origins private.',
            'Global Accelerator gives two static anycast IPs and fast Regional failover for TCP/UDP, without caching.',
            'ElastiCache for Valkey/Redis OSS supports replication, failover, persistence and sorted sets; Memcached is simple and multi-threaded.',
            'DAX provides microsecond reads for DynamoDB with minimal code change.',
            'Lazy loading can serve stale data; write-through keeps the cache current.'
          ],
          examTips: [
            'If the question says “reduce latency for global users of a website, cache static content”, think CloudFront.',
            'If the question says “UDP, static IPs, global users, fast failover”, think Global Accelerator.',
            'If the question says “leaderboard / ranking in real time”, think ElastiCache for Redis OSS or Valkey sorted sets.',
            'If the question says “DynamoDB reads need microsecond latency”, think DAX.',
            'If the question says “make the web tier stateless”, think sessions in ElastiCache or DynamoDB.'
          ],
          services: ['Amazon CloudFront', 'AWS Global Accelerator', 'Amazon ElastiCache', 'DynamoDB Accelerator (DAX)', 'Lambda@Edge', 'CloudFront Functions']
        },
        {
          id: 'compute-serverless',
          title: 'Compute: EC2, Containers & Serverless',
          minutes: 14,
          summary: 'Choose instance families and placement groups, decide between Lambda, ECS, EKS and Fargate, and front APIs with API Gateway.',
          sections: [
            {
              heading: 'EC2 instance families and placement groups',
              html: `<table>
<thead><tr><th>Family</th><th>Optimized for</th><th>Example workloads</th></tr></thead>
<tbody>
<tr><td>General purpose (M, T)</td><td>Balanced; T types are burstable</td><td>Web servers, small databases, dev/test</td></tr>
<tr><td>Compute optimized (C)</td><td>High CPU</td><td>Batch, video encoding, gaming servers, HPC</td></tr>
<tr><td>Memory optimized (R, X)</td><td>Large RAM</td><td>In-memory databases, caches, real-time analytics</td></tr>
<tr><td>Storage optimized (I, D)</td><td>High local disk IOPS/throughput</td><td>NoSQL, data warehousing, distributed file systems</td></tr>
<tr><td>Accelerated computing (P, G, Inf, Trn)</td><td>GPUs / ML chips</td><td>ML training and inference, graphics</td></tr>
</tbody>
</table>
<table>
<thead><tr><th>Placement group</th><th>Layout</th><th>Use when</th></tr></thead>
<tbody>
<tr><td>Cluster</td><td>Packed close together in one AZ</td><td>Lowest latency, highest network throughput between nodes (HPC)</td></tr>
<tr><td>Spread</td><td>Each instance on distinct hardware (max 7 running instances per AZ per group)</td><td>Small number of critical instances that must not fail together</td></tr>
<tr><td>Partition</td><td>Groups of instances on separate racks</td><td>Large distributed systems like Hadoop, Cassandra, Kafka</td></tr>
</tbody>
</table>
<p><strong>Enhanced networking</strong> (ENA) gives higher bandwidth and lower latency; <strong>Elastic Fabric Adapter (EFA)</strong> adds OS-bypass for tightly coupled HPC and ML.</p>`
            },
            {
              heading: 'AWS Lambda',
              html: `<ul>
<li>Event-driven functions; you pay per request and per GB-second of duration. No servers to manage.</li>
<li>Limits to remember: <strong>maximum 15 minutes</strong> per invocation; memory 128 MB to 10,240 MB (CPU scales with memory); up to 10 GB of <code>/tmp</code> ephemeral storage; container images up to 10 GB.</li>
<li><strong>Concurrency</strong>: a Regional quota is shared by all functions (1,000 by default, can be raised). <strong>Reserved concurrency</strong> guarantees and caps a function's share. <strong>Provisioned concurrency</strong> keeps environments initialized to eliminate cold starts. <strong>SnapStart</strong> reduces cold starts for Java, Python and .NET.</li>
<li>Run in a VPC to reach private resources (uses ENIs); use RDS Proxy for relational databases.</li>
<li>For long or multi-step workflows, orchestrate with <strong>AWS Step Functions</strong>.</li>
</ul>
<div class="callout warn">Trap: a job that runs for 45 minutes cannot run in a single Lambda invocation. Consider Fargate, AWS Batch, or splitting work with Step Functions.</div>`
            },
            {
              heading: 'Containers: ECS, EKS and Fargate',
              html: `<table>
<thead><tr><th>Option</th><th>What it is</th><th>Choose when</th></tr></thead>
<tbody>
<tr><td>Amazon ECS</td><td>AWS-native container orchestrator</td><td>Simplest way to run containers on AWS with deep AWS integration</td></tr>
<tr><td>Amazon EKS</td><td>Managed Kubernetes control plane</td><td>You already use Kubernetes or need portability / the Kubernetes ecosystem</td></tr>
<tr><td>AWS Fargate</td><td>Serverless compute engine for ECS and EKS</td><td>No EC2 instances to patch or scale; pay per task vCPU and memory</td></tr>
<tr><td>EC2 launch type / node groups</td><td>Containers on instances you manage</td><td>Need GPUs, special instance types, or maximum cost control at scale</td></tr>
<tr><td>AWS App Runner</td><td>Fully managed web apps from source or image</td><td>Simplest path for a containerized web service or API</td></tr>
</tbody>
</table>
<p>Images live in <strong>Amazon ECR</strong>. In ECS, the <strong>task role</strong> grants permissions to the application, while the <strong>task execution role</strong> lets the agent pull images and write logs.</p>`
            },
            {
              heading: 'Amazon API Gateway',
              html: `<p>API Gateway is a managed front door for APIs: REST APIs (feature-rich: API keys, usage plans, request validation, caching, private endpoints), HTTP APIs (cheaper, faster, simpler), and WebSocket APIs. It handles <strong>throttling</strong>, authorization (IAM, Cognito, Lambda authorizers), and integrates with Lambda, HTTP backends and AWS services directly. Typical serverless stack: <strong>API Gateway → Lambda → DynamoDB</strong>, which scales automatically with no capacity planning.</p>`
            },
            {
              heading: 'Worked scenario',
              html: `<p>A startup's REST API receives unpredictable traffic, from zero at night to thousands of requests per second during promotions. The team has no ops staff. Solution: <strong>API Gateway + Lambda + DynamoDB on-demand</strong>. A nightly 2-hour data processing job exceeds Lambda's 15-minute limit, so it runs as an <strong>ECS task on Fargate</strong> triggered by EventBridge Scheduler.</p>`
            }
          ],
          keyPoints: [
            'Match instance families to the bottleneck: C for CPU, R/X for memory, I/D for local storage, P/G/Inf/Trn for accelerators.',
            'Cluster placement = low latency in one AZ; spread = isolated hardware; partition = rack-aware big data.',
            'Lambda: 15-minute max, up to 10,240 MB memory; provisioned concurrency removes cold starts.',
            'ECS = AWS-native, EKS = Kubernetes, Fargate = serverless compute for both.',
            'API Gateway adds throttling, auth and caching in front of Lambda or other backends.'
          ],
          examTips: [
            'If the question says “tightly coupled HPC, lowest network latency”, think cluster placement group (plus EFA).',
            'If the question says “run containers without managing servers”, think Fargate.',
            'If the question says “existing Kubernetes manifests”, think EKS.',
            'If the question says “processing takes longer than 15 minutes”, rule out a single Lambda invocation.',
            'If the question says “cold start latency is a problem”, think provisioned concurrency.'
          ],
          services: ['Amazon EC2', 'AWS Lambda', 'Amazon ECS', 'Amazon EKS', 'AWS Fargate', 'Amazon ECR', 'AWS App Runner', 'Amazon API Gateway', 'AWS Step Functions', 'AWS Batch']
        },
        {
          id: 'databases-analytics',
          title: 'Choosing Databases & Analytics Services',
          minutes: 13,
          summary: 'Match purpose-built databases to access patterns and choose the right analytics service: Athena, Redshift, Glue, EMR, OpenSearch and QuickSight.',
          sections: [
            {
              heading: 'Purpose-built databases',
              html: `<table>
<thead><tr><th>Need</th><th>Service</th></tr></thead>
<tbody>
<tr><td>Relational, joins, transactions, existing SQL engine</td><td>Amazon RDS (MySQL, PostgreSQL, MariaDB, Oracle, SQL Server, Db2)</td></tr>
<tr><td>Relational with higher performance and availability, cloud-native</td><td>Amazon Aurora</td></tr>
<tr><td>Key-value / document at any scale, single-digit ms, serverless</td><td>Amazon DynamoDB</td></tr>
<tr><td>MongoDB-compatible document database</td><td>Amazon DocumentDB</td></tr>
<tr><td>In-memory, microsecond reads and durable</td><td>Amazon MemoryDB / ElastiCache</td></tr>
<tr><td>Graph relationships (social networks, fraud rings)</td><td>Amazon Neptune</td></tr>
<tr><td>Wide-column, Cassandra-compatible</td><td>Amazon Keyspaces</td></tr>
<tr><td>Time series (IoT, metrics)</td><td>Amazon Timestream</td></tr>
<tr><td>Immutable, cryptographically verifiable ledger</td><td>Amazon QLDB was the classic answer but AWS has ended support for it; current guidance is Aurora PostgreSQL with audit features</td></tr>
<tr><td>Data warehouse, OLAP analytics on structured data</td><td>Amazon Redshift</td></tr>
</tbody>
</table>
<div class="callout">If the stem mentions <strong>full SQL, joins, complex queries</strong> → relational. <strong>Massive scale, simple key lookups, unpredictable traffic, serverless</strong> → DynamoDB.</div>`
            },
            {
              heading: 'Analytics services',
              html: `<table>
<thead><tr><th>Service</th><th>What it is</th><th>Choose when</th></tr></thead>
<tbody>
<tr><td>Amazon Athena</td><td>Serverless SQL directly on data in S3; pay per data scanned</td><td>Ad-hoc queries on logs or a data lake, no infrastructure</td></tr>
<tr><td>Amazon Redshift</td><td>Columnar MPP data warehouse (provisioned or Serverless)</td><td>Complex, frequent BI queries on large structured datasets; Redshift Spectrum queries S3 too</td></tr>
<tr><td>AWS Glue</td><td>Serverless ETL plus the <strong>Data Catalog</strong>; crawlers infer schemas</td><td>Transform data, catalog a data lake for Athena/Redshift/EMR</td></tr>
<tr><td>Amazon EMR</td><td>Managed Hadoop, Spark, Hive, Presto clusters (or EMR Serverless)</td><td>Big data processing with open-source frameworks</td></tr>
<tr><td>Amazon OpenSearch Service</td><td>Search and log analytics</td><td>Full-text search, log dashboards</td></tr>
<tr><td>Amazon QuickSight</td><td>Serverless BI dashboards</td><td>Visualize data for business users</td></tr>
<tr><td>AWS Lake Formation</td><td>Build and govern a data lake with fine-grained permissions</td><td>Column/row-level access control on S3 data lakes</td></tr>
<tr><td>Amazon Managed Service for Apache Flink</td><td>Real-time stream processing</td><td>SQL/Java analytics on Kinesis or Kafka streams</td></tr>
<tr><td>Amazon MSK</td><td>Managed Apache Kafka</td><td>Existing Kafka workloads</td></tr>
</tbody>
</table>
<p>Athena performance and cost tips: store data in <strong>columnar formats (Parquet, ORC)</strong>, compress it, and <strong>partition</strong> by common filters such as date so queries scan less data.</p>`
            },
            {
              heading: 'Worked scenario',
              html: `<p>A retailer dumps application logs into S3 and wants analysts to run occasional SQL queries without managing servers. A <strong>Glue crawler</strong> builds the table definitions in the Glue Data Catalog, and analysts query with <strong>Athena</strong>. A nightly Glue job converts the JSON logs into partitioned Parquet, cutting Athena cost dramatically. Finance's heavy, repeated BI reports run on <strong>Redshift Serverless</strong> with <strong>QuickSight</strong> dashboards.</p>`
            }
          ],
          keyPoints: [
            'Pick databases by access pattern: relational (RDS/Aurora), key-value (DynamoDB), graph (Neptune), time series (Timestream), document (DocumentDB).',
            'Athena = serverless SQL on S3; Redshift = data warehouse; EMR = Spark/Hadoop; Glue = ETL + Data Catalog.',
            'Columnar formats, compression and partitioning reduce Athena cost and improve speed.',
            'OpenSearch for search and log analytics; QuickSight for dashboards.',
            'Use MSK for existing Kafka and Managed Service for Apache Flink for streaming analytics.'
          ],
          examTips: [
            'If the question says “query data in S3 with SQL, no servers, occasional”, think Athena.',
            'If the question says “complex analytical queries on petabytes of structured data”, think Redshift.',
            'If the question says “relationships between entities, social graph, fraud detection”, think Neptune.',
            'If the question says “existing MongoDB workload”, think DocumentDB.'
          ],
          services: ['Amazon RDS', 'Amazon Aurora', 'Amazon DynamoDB', 'Amazon DocumentDB', 'Amazon Neptune', 'Amazon Keyspaces', 'Amazon Timestream', 'Amazon MemoryDB', 'Amazon Redshift', 'Amazon Athena', 'AWS Glue', 'Amazon EMR', 'Amazon OpenSearch Service', 'Amazon QuickSight', 'AWS Lake Formation', 'Amazon MSK']
        }
      ]
    },
    {
      id: 'cost',
      name: 'Design Cost-Optimized Architectures',
      weight: 20,
      summary: 'Pay only for what you need: the right EC2 purchasing model, S3 storage classes and lifecycle rules, cost visibility tools, data transfer-aware designs, and the cheapest migration path.',
      lessons: [
        {
          id: 'ec2-purchasing',
          title: 'EC2 Purchasing Options',
          minutes: 12,
          summary: 'On-Demand, Savings Plans, Reserved Instances, Spot, Dedicated Hosts and Capacity Reservations, and how to combine them.',
          sections: [
            {
              heading: 'The options compared',
              html: `<table>
<thead><tr><th>Option</th><th>Discount vs On-Demand</th><th>Commitment</th><th>Best for</th></tr></thead>
<tbody>
<tr><td>On-Demand</td><td>None</td><td>None, per-second billing (Linux)</td><td>Short-term, unpredictable, can't be interrupted, testing</td></tr>
<tr><td>Compute Savings Plans</td><td>Up to 66%</td><td>$/hour for 1 or 3 years</td><td>Steady usage that may change family, size, Region, OS, or move to <strong>Fargate or Lambda</strong></td></tr>
<tr><td>EC2 Instance Savings Plans</td><td>Up to 72%</td><td>$/hour for 1 or 3 years, one instance family in one Region</td><td>Steady usage on a known family; size, OS and AZ can still change</td></tr>
<tr><td>Standard Reserved Instances</td><td>Up to 72%</td><td>1 or 3 years, specific instance attributes</td><td>Very steady workloads; can be sold on the RI Marketplace</td></tr>
<tr><td>Convertible Reserved Instances</td><td>Up to 66%</td><td>1 or 3 years, can exchange for other attributes</td><td>Steady but may need to change instance type</td></tr>
<tr><td>Spot Instances</td><td>Up to 90%</td><td>None, but AWS can reclaim with a <strong>2-minute warning</strong></td><td>Fault-tolerant, flexible, stateless: batch, CI, big data, rendering</td></tr>
<tr><td>Dedicated Hosts</td><td>N/A (premium)</td><td>On-Demand or reserved</td><td><strong>BYOL</strong> per-socket/per-core licenses, compliance needing host visibility</td></tr>
<tr><td>Dedicated Instances</td><td>N/A (premium)</td><td>None</td><td>Hardware not shared with other customers, no host-level control needed</td></tr>
<tr><td>On-Demand Capacity Reservations</td><td>None by itself</td><td>None; pay whether used or not</td><td>Guarantee capacity in a specific AZ (combine with Savings Plans for discount)</td></tr>
</tbody>
</table>
<p>Payment choices for RIs and Savings Plans: All Upfront (largest discount), Partial Upfront, No Upfront. Three-year terms save more than one-year terms. RIs are a billing discount applied to matching running instances, not physical servers.</p>`
            },
            {
              heading: 'Using Spot well',
              html: `<ul>
<li>Design for interruption: checkpoint work, keep state outside the instance, handle the 2-minute interruption notice (via instance metadata or EventBridge).</li>
<li>Diversify across many instance types and AZs. <strong>EC2 Fleet</strong> and ASG <strong>mixed instances policies</strong> combine On-Demand base capacity with Spot, using allocation strategies such as <em>price-capacity-optimized</em>.</li>
<li>Spot is a poor fit for databases, stateful single instances, or anything that must finish by a deadline without retries.</li>
<li><strong>Fargate Spot</strong> offers the same idea for interruption-tolerant container tasks.</li>
</ul>`
            },
            {
              heading: 'Blending options',
              html: `<p>A typical optimized fleet: cover the always-on baseline with <strong>Savings Plans</strong> (or RIs), handle normal daily peaks with <strong>On-Demand</strong> in the Auto Scaling group, and run batch or burst capacity on <strong>Spot</strong>. Turn off non-production environments outside business hours with the Instance Scheduler or scheduled scaling, and right-size with Compute Optimizer before committing to anything.</p>
<div class="callout warn">Trap: never buy 3-year RIs for workloads that run only a few hours a day or are about to be retired; you pay for every hour of the term.</div>`
            },
            {
              heading: 'Worked scenario',
              html: `<p>A company runs a web app 24/7 on m-family instances, plans to move part of it to Fargate next year, and runs nightly video transcoding that can be restarted. Best mix: a <strong>Compute Savings Plan</strong> for the steady baseline (it automatically covers the Fargate usage later), On-Demand for unpredictable peaks, and <strong>Spot</strong> for the transcoding fleet with diversified instance types.</p>`
            }
          ],
          keyPoints: [
            'Spot = up to 90% off for interruptible work with a 2-minute notice.',
            'Compute Savings Plans are the most flexible commitment (covers EC2, Fargate, Lambda).',
            'EC2 Instance Savings Plans and Standard RIs give the deepest commitment discounts (up to 72%).',
            'Dedicated Hosts for BYOL licensing tied to sockets or cores.',
            'Capacity Reservations guarantee capacity in an AZ but give no discount by themselves.'
          ],
          examTips: [
            'If the question says “steady-state, 1 or 3 years, flexibility across instance families or to Lambda/Fargate”, think Compute Savings Plans.',
            'If the question says “can be interrupted, fault-tolerant, lowest cost”, think Spot.',
            'If the question says “existing per-socket license”, think Dedicated Hosts.',
            'If the question says “guarantee capacity in a specific AZ for an event”, think On-Demand Capacity Reservation.'
          ],
          services: ['Amazon EC2', 'Savings Plans', 'Reserved Instances', 'Spot Instances', 'Dedicated Hosts', 'EC2 Fleet', 'On-Demand Capacity Reservations']
        },
        {
          id: 's3-storage-classes',
          title: 'S3 Storage Classes, Lifecycle & Data Protection',
          minutes: 14,
          summary: 'Choose the cheapest S3 class for each access pattern, automate transitions with lifecycle rules, and protect data with versioning, replication and Object Lock.',
          sections: [
            {
              heading: 'Storage classes',
              html: `<table>
<thead><tr><th>Class</th><th>AZs</th><th>Retrieval</th><th>Minimum duration</th><th>Use for</th></tr></thead>
<tbody>
<tr><td>S3 Standard</td><td>≥3</td><td>Milliseconds</td><td>None</td><td>Frequently accessed data</td></tr>
<tr><td>S3 Intelligent-Tiering</td><td>≥3</td><td>Milliseconds (optional archive tiers are slower)</td><td>None</td><td><strong>Unknown or changing</strong> access patterns; small monthly monitoring fee per object, no retrieval fees</td></tr>
<tr><td>S3 Standard-IA</td><td>≥3</td><td>Milliseconds, per-GB retrieval fee</td><td>30 days</td><td>Infrequent access but needs fast retrieval (backups, DR copies)</td></tr>
<tr><td>S3 One Zone-IA</td><td>1</td><td>Milliseconds, retrieval fee</td><td>30 days</td><td>Re-creatable infrequent data, secondary copies</td></tr>
<tr><td>S3 Glacier Instant Retrieval</td><td>≥3</td><td>Milliseconds</td><td>90 days</td><td>Archive accessed about once a quarter that still needs instant access</td></tr>
<tr><td>S3 Glacier Flexible Retrieval</td><td>≥3</td><td>Expedited 1–5 min, Standard 3–5 h, Bulk 5–12 h</td><td>90 days</td><td>Archives, backups</td></tr>
<tr><td>S3 Glacier Deep Archive</td><td>≥3</td><td>Standard within 12 h, Bulk within 48 h</td><td>180 days</td><td>Lowest cost long-term retention (7–10 year compliance)</td></tr>
</tbody>
</table>
<p>All classes except One Zone-IA (and Express One Zone) store data across multiple AZs and are designed for 11 nines of durability. Standard-IA and One Zone-IA also bill a minimum object size of 128 KB, so they are a poor fit for millions of tiny objects.</p>`
            },
            {
              heading: 'Lifecycle rules',
              html: `<p>Lifecycle configurations apply to a bucket, prefix or tag and perform:</p>
<ul>
<li><strong>Transition actions</strong>: e.g. Standard → Standard-IA after 30 days → Glacier Flexible Retrieval after 90 days → Deep Archive after 365 days.</li>
<li><strong>Expiration actions</strong>: delete objects after N days, delete noncurrent versions, clean up <strong>incomplete multipart uploads</strong> and expired delete markers.</li>
</ul>
<p>Objects must stay in Standard at least 30 days before a lifecycle transition to Standard-IA or One Zone-IA. Use <strong>S3 Storage Class Analysis</strong> or <strong>S3 Storage Lens</strong> to discover access patterns before writing rules.</p>
<div class="callout warn">Trap: moving data that is still read frequently into an IA class can cost <em>more</em> because of retrieval fees. If you cannot predict access, choose Intelligent-Tiering.</div>`
            },
            {
              heading: 'Versioning, replication and Object Lock',
              html: `<ul>
<li><strong>Versioning</strong> keeps every version of an object; a delete adds a delete marker instead of removing data. Once enabled it can only be suspended. Add <strong>MFA Delete</strong> to require MFA for permanent version deletion.</li>
<li><strong>Replication</strong> (requires versioning on source and destination): <strong>Cross-Region Replication (CRR)</strong> for compliance, DR and lower latency; <strong>Same-Region Replication (SRR)</strong> for log aggregation or copies across accounts. Only new objects replicate by default; use <strong>S3 Batch Replication</strong> for existing ones. <strong>Replication Time Control</strong> offers an SLA (99.99% of objects within 15 minutes).</li>
<li><strong>S3 Object Lock</strong> (WORM, requires versioning): <em>Governance mode</em> lets users with special permission override or delete; <em>Compliance mode</em> means nobody, including the root user, can delete or shorten retention until it expires. <strong>Legal hold</strong> prevents deletion indefinitely until removed.</li>
<li><strong>S3 Glacier Vault Lock</strong> applies an immutable policy to Glacier vaults.</li>
</ul>`
            },
            {
              heading: 'Other S3 cost levers',
              html: `<ul>
<li><strong>Requester Pays</strong> buckets bill the downloader for requests and data transfer.</li>
<li><strong>S3 Bucket Keys</strong> reduce SSE-KMS request costs.</li>
<li>Serve popular content through <strong>CloudFront</strong> to reduce S3 request and data transfer costs.</li>
<li>Use <strong>gateway VPC endpoints</strong> so private workloads do not pay NAT gateway processing for S3 traffic.</li>
</ul>`
            },
            {
              heading: 'Worked scenario',
              html: `<p>A bank must keep transaction statements for 7 years, unalterable, and statements are viewed frequently in the first month, rarely after that, and almost never after a year. Design: a versioned bucket with <strong>Object Lock in compliance mode</strong> (7-year retention), a lifecycle rule moving objects to <strong>Standard-IA at 30 days</strong>, <strong>Glacier Deep Archive at 365 days</strong>, and expiring them after 7 years.</p>`
            }
          ],
          keyPoints: [
            'Intelligent-Tiering is the answer for unknown or changing access patterns.',
            'Standard-IA and One Zone-IA have 30-day minimums and retrieval fees; Glacier Instant/Flexible have 90 days; Deep Archive 180 days.',
            'Deep Archive retrieval: within 12 hours (standard) or 48 hours (bulk).',
            'Replication requires versioning on both buckets; only new objects replicate unless you use Batch Replication.',
            'Object Lock compliance mode cannot be bypassed by anyone, including root; governance mode can be by privileged users.',
            'Lifecycle rules should also clean up incomplete multipart uploads and old noncurrent versions.'
          ],
          examTips: [
            'If the question says “access pattern unknown or unpredictable”, think S3 Intelligent-Tiering.',
            'If the question says “data can be recreated and accessed infrequently”, think One Zone-IA.',
            'If the question says “retain for years, retrieval within 12–48 hours acceptable, lowest cost”, think Glacier Deep Archive.',
            'If the question says “WORM, nobody can delete, regulatory”, think Object Lock in compliance mode.',
            'If the question says “protect against accidental deletion”, think versioning (plus MFA Delete).'
          ],
          services: ['Amazon S3', 'S3 Intelligent-Tiering', 'S3 Glacier', 'S3 Lifecycle', 'S3 Replication', 'S3 Object Lock', 'S3 Storage Lens']
        },
        {
          id: 'cost-tools-transfer',
          title: 'Cost Management Tools & Data Transfer Costs',
          minutes: 12,
          summary: 'Visualize, forecast, alert on and right-size spend, and design architectures that avoid unnecessary data transfer charges.',
          sections: [
            {
              heading: 'Cost visibility and control tools',
              html: `<table>
<thead><tr><th>Tool</th><th>What it does</th><th>Exam keyword</th></tr></thead>
<tbody>
<tr><td>AWS Cost Explorer</td><td>Visualize and analyze historical costs and usage, forecast future spend, view RI and Savings Plans utilization and recommendations</td><td>“Analyze spend trends”, “which service costs most”</td></tr>
<tr><td>AWS Budgets</td><td>Set cost, usage, RI or Savings Plans budgets with alerts on actual or <strong>forecasted</strong> amounts; <strong>Budget actions</strong> can apply IAM/SCP policies or stop instances</td><td>“Alert when spending will exceed”</td></tr>
<tr><td>AWS Cost Anomaly Detection</td><td>ML-based detection of unusual spend with alerts</td><td>“Detect unexpected spikes”</td></tr>
<tr><td>Cost and Usage Reports / Data Exports</td><td>Most detailed line-item billing data delivered to S3, queryable with Athena</td><td>“Granular hourly billing data”</td></tr>
<tr><td>AWS Compute Optimizer</td><td>ML right-sizing recommendations for EC2, Auto Scaling groups, EBS, Lambda, ECS on Fargate and RDS, based on CloudWatch metrics</td><td>“Right-size over-provisioned instances”</td></tr>
<tr><td>AWS Trusted Advisor</td><td>Best-practice checks across cost, performance, security, fault tolerance, service limits; full set of checks requires Business, Enterprise On-Ramp or Enterprise Support</td><td>“Idle load balancers, underutilized instances, open security groups”</td></tr>
<tr><td>Cost allocation tags</td><td>Tags activated in the Billing console so costs can be grouped by project, team or environment</td><td>“Chargeback per department”</td></tr>
<tr><td>AWS Pricing Calculator</td><td>Estimate costs before building</td><td>“Estimate cost of a new architecture”</td></tr>
</tbody>
</table>`
            },
            {
              heading: 'Data transfer cost patterns',
              html: `<ul>
<li><strong>Data in from the internet</strong> is free.</li>
<li><strong>Data out to the internet</strong> is charged per GB; delivering through <strong>CloudFront</strong> is usually cheaper and data from AWS origins to CloudFront is not charged.</li>
<li>Traffic <strong>within the same AZ</strong> over private IPs is free; traffic <strong>between AZs</strong> is charged in each direction; traffic <strong>between Regions</strong> is charged.</li>
<li>Using a <strong>public or Elastic IP</strong> between instances, even in the same AZ, is charged like cross-AZ traffic. Use private IPs.</li>
<li><strong>NAT gateways</strong> charge per hour and per GB processed. Use <strong>gateway endpoints</strong> for S3 and DynamoDB, and keep one NAT gateway per AZ to avoid cross-AZ hops.</li>
<li><strong>Direct Connect</strong> data transfer out rates are lower than internet rates, which matters for large hybrid volumes.</li>
<li>Keep chatty components in the same AZ where availability permits (e.g. a batch cluster), and replicate across AZs/Regions only what resilience requires.</li>
</ul>
<div class="callout">Multi-AZ RDS replication traffic between primary and standby is not charged, but cross-Region read replica traffic is.</div>`
            },
            {
              heading: 'Other cost-optimization patterns',
              html: `<ul>
<li>Move from gp2 to <strong>gp3</strong> (cheaper per GB with baseline performance included).</li>
<li>Delete unattached EBS volumes, old snapshots and idle Elastic IPs; archive snapshots to the EBS Snapshots Archive tier.</li>
<li>Use <strong>Graviton (Arm)</strong> instances for better price-performance where software supports it.</li>
<li>Prefer serverless (Lambda, Fargate, DynamoDB on-demand, Aurora Serverless v2) for spiky or low-utilization workloads so you are not paying for idle capacity.</li>
<li>Scale on demand with Auto Scaling instead of provisioning for peak.</li>
</ul>`
            },
            {
              heading: 'Worked scenario',
              html: `<p>A company's monthly bill doubled. <strong>Cost Explorer</strong> shows the increase is in “EC2-Other”, specifically NAT gateway data processing: private instances are pulling terabytes from S3 through the NAT gateway. Adding an <strong>S3 gateway endpoint</strong> removes the charge entirely. They then set an <strong>AWS Budget</strong> with a forecast alert at 80% and enable <strong>Cost Anomaly Detection</strong> to catch the next surprise earlier.</p>`
            }
          ],
          keyPoints: [
            'Cost Explorer analyzes and forecasts; Budgets alerts (and can act); Anomaly Detection catches spikes; CUR/Data Exports give line-item detail.',
            'Compute Optimizer right-sizes compute and EBS; Trusted Advisor checks best practices (full checks need Business support or higher).',
            'Inbound data is free; cross-AZ and cross-Region traffic is charged; same-AZ private IP traffic is free.',
            'NAT gateway processing charges are a common hidden cost; fix S3/DynamoDB traffic with gateway endpoints.',
            'Use cost allocation tags for chargeback.'
          ],
          examTips: [
            'If the question says “notify when forecasted costs exceed a threshold”, think AWS Budgets.',
            'If the question says “recommendations to right-size EC2 based on utilization”, think Compute Optimizer.',
            'If the question says “reduce data transfer cost for global content delivery”, think CloudFront.',
            'If the question says “high NAT gateway costs from S3 or DynamoDB access”, think gateway VPC endpoints.'
          ],
          services: ['AWS Cost Explorer', 'AWS Budgets', 'AWS Cost Anomaly Detection', 'AWS Cost and Usage Report', 'AWS Compute Optimizer', 'AWS Trusted Advisor', 'AWS Pricing Calculator', 'Amazon CloudFront', 'VPC endpoints']
        },
        {
          id: 'migration-transfer',
          title: 'Migration & Bulk Data Transfer',
          minutes: 11,
          summary: 'Move data and databases into AWS cost-effectively with DataSync, Snowball Edge, Transfer Family, DMS and Application Migration Service.',
          sections: [
            {
              heading: 'Online vs offline transfer: do the math',
              html: `<p>Before picking a service, estimate transfer time. 100 TB over a fully used 1 Gbps link takes roughly <strong>9–10 days</strong> (100 × 10<sup>12</sup> bytes × 8 bits ÷ 10<sup>9</sup> bits/s ≈ 800,000 seconds), and real links are rarely fully available. If the network cannot finish in the required window, or using it would disrupt the business, ship the data on a device.</p>
<table>
<thead><tr><th>Service</th><th>Type</th><th>Choose when</th></tr></thead>
<tbody>
<tr><td>AWS DataSync</td><td>Online, agent-based</td><td>Copy or schedule recurring syncs from NFS, SMB, HDFS or object storage to S3, EFS or FSx; handles encryption, integrity checks, bandwidth throttling. Also moves data between AWS storage services.</td></tr>
<tr><td>AWS Snowball Edge</td><td>Offline device (Storage Optimized or Compute Optimized)</td><td>Tens of TB to petabytes with limited bandwidth, or edge computing in disconnected locations. Several devices can be used in parallel.</td></tr>
<tr><td>AWS Transfer Family</td><td>Managed SFTP, FTPS, FTP, AS2</td><td>Partners upload files over SFTP into S3 or EFS without changing their workflow</td></tr>
<tr><td>S3 Transfer Acceleration</td><td>Online via edge locations</td><td>Faster long-distance uploads to one bucket</td></tr>
<tr><td>AWS Direct Connect</td><td>Dedicated link</td><td>Ongoing large hybrid transfers with consistent performance</td></tr>
</tbody>
</table>
<div class="callout">AWS has retired Snowmobile and the Snowcone device, and has narrowed Snow family availability over time. On the exam, Snowball Edge remains the standard “offline transfer” answer; in real projects check current availability and consider DataSync over Direct Connect.</div>`
            },
            {
              heading: 'Database migration: DMS and Schema Conversion',
              html: `<ul>
<li><strong>AWS Database Migration Service (DMS)</strong> migrates data with a <strong>full load followed by change data capture (CDC)</strong>, so the source stays online and cutover downtime is minimal.</li>
<li><strong>Homogeneous</strong> migrations (MySQL → RDS MySQL) need no schema conversion; native tools or DMS work.</li>
<li><strong>Heterogeneous</strong> migrations (Oracle → Aurora PostgreSQL, SQL Server → MySQL) first convert the schema and code with <strong>DMS Schema Conversion</strong> or the <strong>AWS Schema Conversion Tool (SCT)</strong>, then move data with DMS.</li>
<li>DMS can also continuously replicate into S3, Kinesis, Redshift or OpenSearch.</li>
<li>For very large databases, combine Snowball Edge for the bulk load with DMS CDC for the changes.</li>
</ul>`
            },
            {
              heading: 'Server and application migration',
              html: `<ul>
<li><strong>AWS Application Migration Service (MGN)</strong>: lift-and-shift servers with continuous block-level replication and a short cutover window; the recommended rehost tool.</li>
<li><strong>AWS Migration Hub</strong>: track migrations across tools; <strong>Application Discovery Service</strong> collects on-prem server inventory and dependencies to plan.</li>
<li><strong>VMware Cloud on AWS</strong> or importing VMs (VM Import/Export) for virtualization-centric estates.</li>
<li>The <em>7 Rs</em>: retire, retain, rehost, relocate, repurchase, replatform, refactor. “Minimal changes, fastest” = rehost; “use managed DB but keep app” = replatform.</li>
</ul>`
            },
            {
              heading: 'Worked scenario',
              html: `<p>A media company has 600 TB of archives on a NAS with a 500 Mbps internet link and needs it in S3 within a month, then wants nightly syncs of new files. Network math says over 100 days online, so they order multiple <strong>Snowball Edge Storage Optimized</strong> devices for the bulk copy, then use <strong>DataSync</strong> for the incremental nightly sync. Their Oracle database moves to Aurora PostgreSQL with <strong>DMS Schema Conversion + DMS full load and CDC</strong>.</p>`
            }
          ],
          keyPoints: [
            'Calculate transfer time first: 100 TB over 1 Gbps is roughly 9–10 days at full utilization.',
            'DataSync = online, scheduled, managed file/object transfer; Snowball Edge = offline bulk transfer.',
            'Transfer Family = managed SFTP/FTPS/FTP/AS2 into S3 or EFS.',
            'DMS full load + CDC minimizes downtime; heterogeneous migrations need schema conversion first.',
            'Application Migration Service (MGN) is the lift-and-shift server migration tool.'
          ],
          examTips: [
            'If the question says “petabytes, limited bandwidth, weeks”, think Snowball Edge (multiple devices).',
            'If the question says “recurring or scheduled transfer from on-prem NFS/SMB to S3/EFS”, think DataSync.',
            'If the question says “partners upload via SFTP”, think Transfer Family.',
            'If the question says “migrate Oracle to Aurora with minimal downtime”, think Schema Conversion + DMS with CDC.',
            'If the question says “rehost servers quickly”, think Application Migration Service.'
          ],
          services: ['AWS DataSync', 'AWS Snowball Edge', 'AWS Transfer Family', 'AWS DMS', 'DMS Schema Conversion', 'AWS SCT', 'AWS Application Migration Service', 'AWS Migration Hub']
        }
      ]
    }
  ],
  flashcards: [
    { domain: 'secure', front: `IAM policy evaluation: what wins?`, back: `An <b>explicit Deny</b> always wins. Otherwise an Allow is required, and every applicable SCP, permission boundary and session policy must also permit the action. Default is implicit deny.` },
    { domain: 'secure', front: `What does a permission boundary do?`, back: `Sets the <b>maximum</b> permissions an IAM user or role can have. It never grants permissions; effective access = identity policy ∩ boundary.` },
    { domain: 'secure', front: `Do SCPs affect the management account?`, back: `<b>No.</b> SCPs apply to member accounts (including their root users) but never to the management account, and they never grant permissions.` },
    { domain: 'secure', front: `Why use an external ID in a role trust policy?`, back: `To prevent the <b>confused deputy</b> problem when a third party assumes a role in your account.` },
    { domain: 'secure', front: `Cognito user pool vs identity pool`, back: `<b>User pool</b>: authentication, returns JWTs. <b>Identity pool</b>: exchanges tokens for temporary <b>AWS credentials</b> via IAM roles.` },
    { domain: 'secure', front: `Security group vs NACL (state and rules)`, back: `SG: <b>stateful</b>, allow rules only, instance/ENI level. NACL: <b>stateless</b>, allow + deny, subnet level, rules evaluated in number order.` },
    { domain: 'secure', front: `Which services support gateway VPC endpoints?`, back: `Only <b>Amazon S3 and DynamoDB</b>. Gateway endpoints are free and work via route table entries.` },
    { domain: 'secure', front: `Interface endpoint (PrivateLink) key facts`, back: `An ENI with private IPs in your subnet, supports most AWS services and your own NLB-backed services, protected by security groups, charged hourly + per GB, reachable from on-prem.` },
    { domain: 'secure', front: `Is AWS Direct Connect encrypted?`, back: `<b>Not by default.</b> Add MACsec (supported dedicated connections) or run an IPsec Site-to-Site VPN over the DX connection.` },
    { domain: 'secure', front: `Secrets Manager vs Parameter Store`, back: `<b>Secrets Manager</b>: built-in automatic rotation (RDS, Aurora, Redshift, DocumentDB), cross-Region replication, per-secret cost. <b>Parameter Store</b>: cheaper/free standard tier, no native rotation.` },
    { domain: 'secure', front: `Which KMS key type is needed to share encrypted snapshots cross-account?`, back: `A <b>customer managed key</b>, because you can edit its key policy. AWS managed keys cannot be shared.` },
    { domain: 'secure', front: `In which Region must an ACM certificate for CloudFront be?`, back: `<b>us-east-1</b> (N. Virginia).` },
    { domain: 'secure', front: `GuardDuty vs Macie vs Inspector`, back: `<b>GuardDuty</b>: threat detection from logs. <b>Macie</b>: sensitive data/PII in S3. <b>Inspector</b>: vulnerability scanning of EC2, ECR images and Lambda.` },
    { domain: 'secure', front: `Shield Standard vs Shield Advanced`, back: `<b>Standard</b>: free, automatic L3/L4 DDoS protection. <b>Advanced</b>: paid, enhanced detection, 24x7 Shield Response Team, DDoS cost protection, covers CloudFront, Route 53, Global Accelerator, ELB, Elastic IPs.` },
    { domain: 'secure', front: `Where can AWS WAF be attached?`, back: `CloudFront, Application Load Balancer, API Gateway, AppSync, Cognito user pools, App Runner and Verified Access. <b>Not</b> Network Load Balancers.` },
    { domain: 'secure', front: `CloudHSM vs KMS`, back: `<b>CloudHSM</b>: single-tenant HSMs in your VPC, you exclusively manage keys. <b>KMS</b>: fully managed, multi-tenant, integrated with most AWS services.` },
    { domain: 'resilient', front: `SQS visibility timeout: default and max`, back: `Default <b>30 seconds</b>, maximum <b>12 hours</b>. If a message is not deleted within it, it becomes visible again.` },
    { domain: 'resilient', front: `SQS message retention range`, back: `1 minute to <b>14 days</b> (default 4 days).` },
    { domain: 'resilient', front: `SQS Standard vs FIFO`, back: `Standard: near-unlimited throughput, at-least-once, best-effort order. FIFO: strict order per <b>message group ID</b>, exactly-once processing, name ends in .fifo.` },
    { domain: 'resilient', front: `What is the SNS + SQS fan-out pattern?`, back: `Publish once to an SNS topic subscribed by multiple SQS queues, so each consumer gets its own durable copy and processes independently.` },
    { domain: 'resilient', front: `Kinesis Data Streams retention`, back: `24 hours by default, extendable up to <b>365 days</b>; consumers can replay records.` },
    { domain: 'resilient', front: `When choose EventBridge over SNS?`, back: `When routing events by content from AWS services or SaaS partners, needing schema registry, archive/replay, cross-account buses or schedules.` },
    { domain: 'resilient', front: `RDS Multi-AZ vs read replica`, back: `<b>Multi-AZ</b>: synchronous standby, automatic failover, for HA. <b>Read replica</b>: asynchronous, readable, scales reads, can be cross-Region, manual promotion.` },
    { domain: 'resilient', front: `How does Aurora store data?`, back: `<b>Six copies across three AZs</b> in a shared, self-healing storage volume; up to 15 Aurora Replicas share it.` },
    { domain: 'resilient', front: `Aurora Global Database DR numbers`, back: `Cross-Region replication typically under <b>1 second</b> of lag (RPO), and a secondary Region can be promoted in about <b>a minute</b> (RTO).` },
    { domain: 'resilient', front: `DynamoDB global tables`, back: `Multi-Region, <b>multi-active</b> replication: read and write in any replica Region.` },
    { domain: 'resilient', front: `Pilot light vs warm standby`, back: `<b>Pilot light</b>: data replicated, app servers off. <b>Warm standby</b>: full stack running at reduced capacity, scale up on failover.` },
    { domain: 'resilient', front: `Order the DR strategies from cheapest to most expensive`, back: `Backup and restore → Pilot light → Warm standby → Multi-site active/active.` },
    { domain: 'resilient', front: `Route 53 routing policy for active-passive DR`, back: `<b>Failover</b> routing with health checks on the primary record.` },
    { domain: 'resilient', front: `Why set ASG health check type to ELB?`, back: `So instances failing the load balancer's application health check are replaced, not just those failing EC2 status checks.` },
    { domain: 'resilient', front: `VPC peering vs Transit Gateway`, back: `Peering: one-to-one, <b>non-transitive</b>, no hourly fee. Transit Gateway: hub and spoke, <b>transitive</b>, attaches VPCs, VPNs and Direct Connect.` },
    { domain: 'performance', front: `gp3 baseline performance`, back: `<b>3,000 IOPS and 125 MB/s</b> at any size; IOPS and throughput can be provisioned independently of capacity.` },
    { domain: 'performance', front: `Instance store key property`, back: `Very high IOPS, low latency, but <b>ephemeral</b>: data is lost when the instance stops, terminates or the host fails.` },
    { domain: 'performance', front: `EFS vs FSx for Windows File Server`, back: `<b>EFS</b>: NFS for Linux, elastic, multi-AZ. <b>FSx for Windows</b>: SMB, NTFS, Active Directory integration.` },
    { domain: 'performance', front: `When FSx for Lustre?`, back: `HPC, ML training, media processing needing very high throughput; integrates with S3 to lazy-load and write back data.` },
    { domain: 'performance', front: `S3 request rate per prefix`, back: `At least <b>3,500</b> PUT/COPY/POST/DELETE and <b>5,500</b> GET/HEAD requests per second per prefix.` },
    { domain: 'performance', front: `S3 object size limits`, back: `Max object <b>5 TB</b>; single PUT max 5 GB; multipart upload recommended above 100 MB.` },
    { domain: 'performance', front: `CloudFront vs Global Accelerator`, back: `CloudFront: HTTP(S) CDN with <b>caching</b>. Global Accelerator: <b>two static anycast IPs</b>, TCP/UDP, no caching, fast Regional failover.` },
    { domain: 'performance', front: `What is Origin Access Control (OAC)?`, back: `Lets CloudFront access a <b>private</b> S3 bucket; the bucket policy allows only that distribution. Replaces legacy OAI.` },
    { domain: 'performance', front: `ElastiCache Redis OSS/Valkey vs Memcached`, back: `Redis OSS/Valkey: replication, Multi-AZ failover, persistence, rich data types (sorted sets). Memcached: simple, multi-threaded, no replication or persistence.` },
    { domain: 'performance', front: `What does DAX provide?`, back: `In-memory cache for DynamoDB delivering <b>microsecond</b> read latency with minimal code changes.` },
    { domain: 'performance', front: `Lambda maximum execution time and memory`, back: `<b>15 minutes</b>; memory 128 MB to <b>10,240 MB</b>.` },
    { domain: 'performance', front: `Cluster vs spread vs partition placement groups`, back: `Cluster: low latency in one AZ (HPC). Spread: each instance on distinct hardware (max 7 per AZ). Partition: racks isolated for Hadoop/Cassandra/Kafka.` },
    { domain: 'performance', front: `Athena cost optimization`, back: `Use <b>columnar formats</b> (Parquet/ORC), compression and partitioning so queries scan less data; you pay per data scanned.` },
    { domain: 'cost', front: `Spot Instance discount and interruption notice`, back: `Up to <b>90%</b> off On-Demand; AWS gives a <b>2-minute</b> interruption notice.` },
    { domain: 'cost', front: `Compute Savings Plans vs EC2 Instance Savings Plans`, back: `<b>Compute SP</b>: up to 66%, any family, size, Region, OS, plus Fargate and Lambda. <b>EC2 Instance SP</b>: up to 72%, locked to one family in one Region.` },
    { domain: 'cost', front: `When are Dedicated Hosts required?`, back: `For <b>BYOL</b> software licensed per socket, per core or per VM, or compliance needing visibility of the physical host.` },
    { domain: 'cost', front: `S3 Intelligent-Tiering is best when...`, back: `Access patterns are <b>unknown or changing</b>. Small monitoring fee per object, no retrieval fees.` },
    { domain: 'cost', front: `Minimum storage durations for S3 classes`, back: `Standard-IA / One Zone-IA: <b>30 days</b>. Glacier Instant & Flexible Retrieval: <b>90 days</b>. Deep Archive: <b>180 days</b>.` },
    { domain: 'cost', front: `Glacier Deep Archive retrieval times`, back: `Standard within <b>12 hours</b>, Bulk within <b>48 hours</b>.` },
    { domain: 'cost', front: `Object Lock governance vs compliance mode`, back: `<b>Governance</b>: users with special permissions can override. <b>Compliance</b>: nobody, not even root, can delete or shorten retention.` },
    { domain: 'cost', front: `AWS Budgets vs Cost Explorer`, back: `<b>Budgets</b>: alerts (and actions) on actual or forecasted spend. <b>Cost Explorer</b>: analyze and visualize historical cost and forecast.` },
    { domain: 'cost', front: `Which data transfer is free?`, back: `Inbound from the internet, and traffic within the same AZ using private IPs. Cross-AZ, cross-Region and internet egress are charged.` },
    { domain: 'cost', front: `DataSync vs Snowball Edge`, back: `<b>DataSync</b>: online, scheduled transfers over the network. <b>Snowball Edge</b>: offline physical device for large data with limited bandwidth.` },
    { domain: 'cost', front: `How does DMS keep downtime minimal?`, back: `Full load followed by <b>change data capture (CDC)</b> keeps the target in sync while the source stays live until cutover.` }
  ],
  questions: [
    {
      id: 'saa-001', domain: 'secure', lesson: 'iam-fundamentals', multi: false,
      question: `A company uses a third-party SaaS vendor to analyze its AWS resource configurations. The vendor runs in its own AWS account and needs read-only access to the company's account. The security team wants to avoid long-term credentials and protect against the confused deputy problem. What should a solutions architect do?`,
      options: [
        `Create an IAM user with the ReadOnlyAccess policy and send the access keys to the vendor over an encrypted channel.`,
        `Create an IAM role with the ReadOnlyAccess policy and a trust policy that allows the vendor's AWS account to assume it only when a vendor-supplied external ID is provided.`,
        `Add the vendor's AWS account ID to a resource-based policy on every resource the vendor needs to read.`,
        `Create an IAM group with read-only permissions and add the vendor's IAM users to the group.`
      ],
      answer: [1],
      explanation: `A cross-account <b>IAM role</b> gives the vendor temporary STS credentials, and the <b>external ID</b> condition prevents the confused deputy problem. Sharing IAM user access keys creates long-term credentials that must be rotated and can leak. Resource-based policies are not supported by every service and would be unmanageable at scale. IAM groups can only contain users from your own account; you cannot add another account's users.`
    },
    {
      id: 'saa-002', domain: 'secure', lesson: 'governance-threat-detection', multi: false,
      question: `A company manages 60 AWS accounts with AWS Organizations. The security team requires that no one in any member account, including account administrators and the root user, can stop or delete AWS CloudTrail trails. What is the MOST effective solution?`,
      options: [
        `Attach an IAM policy that denies cloudtrail:StopLogging and cloudtrail:DeleteTrail to every IAM user and role in each account.`,
        `Enable AWS Config rules in each account to detect when CloudTrail is disabled and notify the security team.`,
        `Create a service control policy that denies cloudtrail:StopLogging and cloudtrail:DeleteTrail and attach it to the organization root or the relevant OUs.`,
        `Enable Amazon GuardDuty in all accounts to alert on CloudTrail changes.`
      ],
      answer: [2],
      explanation: `An <b>SCP</b> sets maximum permissions for every principal in member accounts, including the root user, so a deny is enforced centrally and cannot be removed by account admins. IAM policies per user are hard to maintain, do not apply to the root user, and admins could remove them. AWS Config and GuardDuty are <em>detective</em> controls; they report after the fact rather than preventing the action.`
    },
    {
      id: 'saa-003', domain: 'secure', lesson: 'iam-fundamentals', multi: false,
      question: `Developers need to create IAM roles for the Lambda functions they deploy. The security team is concerned that developers could create roles with more permissions than they themselves have. Which solution prevents privilege escalation while still letting developers create roles?`,
      options: [
        `Allow iam:CreateRole only when the request attaches an approved permissions boundary, using the iam:PermissionsBoundary condition key, and require that boundary on the developers' own roles.`,
        `Remove iam:CreateRole from developers and have the security team create every role manually.`,
        `Apply an SCP that denies all IAM actions in the development account.`,
        `Enable IAM Access Analyzer to review roles after they are created.`
      ],
      answer: [0],
      explanation: `<b>Permission boundaries</b> are designed for safe delegation: every role developers create is capped by the approved boundary, so they cannot escalate privileges. Having the security team create every role works but adds heavy operational overhead and slows delivery. An SCP denying all IAM actions would stop developers from creating roles at all. Access Analyzer is detective and reviews after the fact, which does not prevent escalation.`
    },
    {
      id: 'saa-004', domain: 'secure', lesson: 'governance-threat-detection', multi: false,
      question: `An administrator in a member account of AWS Organizations has the AdministratorAccess managed policy attached. When she tries to launch EC2 instances in the ap-southeast-2 Region, she receives an AccessDenied error. Launching in us-east-1 works. What is the MOST likely cause?`,
      options: [
        `The AdministratorAccess policy does not include EC2 permissions in ap-southeast-2.`,
        `The account has reached its EC2 service quota in ap-southeast-2.`,
        `The ap-southeast-2 Region requires a separate IAM user.`,
        `An SCP applied to the account or its OU denies actions when aws:RequestedRegion is not in an approved list.`
      ],
      answer: [3],
      explanation: `A Region-restriction <b>SCP</b> using <code>aws:RequestedRegion</code> is a very common guardrail and overrides any IAM allow. AdministratorAccess grants all actions on all resources in all Regions. Hitting a service quota produces a limit-exceeded error, not AccessDenied. IAM is global, so the same user works in every Region.`
    },
    {
      id: 'saa-005', domain: 'secure', lesson: 'vpc-networking', multi: false,
      question: `EC2 instances in private subnets process files stored in Amazon S3 in the same Region. Today the traffic flows through a NAT gateway. The company wants to keep traffic off the internet and reduce costs. What should a solutions architect recommend?`,
      options: [
        `Create an S3 interface endpoint in each private subnet.`,
        `Create an S3 gateway VPC endpoint and associate it with the private subnets' route tables.`,
        `Move the instances to public subnets and assign Elastic IP addresses.`,
        `Enable S3 Transfer Acceleration on the bucket.`
      ],
      answer: [1],
      explanation: `An <b>S3 gateway endpoint</b> is free, keeps traffic on the AWS network, and removes NAT gateway data processing charges. An interface endpoint would also keep traffic private but adds hourly and per-GB charges, so it is not the most cost-effective. Public subnets with Elastic IPs send traffic over the internet path and reduce security. Transfer Acceleration speeds long-distance uploads via edge locations and costs extra; it does not help in-Region private access.`
    },
    {
      id: 'saa-006', domain: 'secure', lesson: 'vpc-networking', multi: false,
      question: `A SaaS provider wants to expose its API, running behind a Network Load Balancer, privately to hundreds of customer VPCs in different AWS accounts. Many customers use overlapping CIDR ranges. Traffic must not traverse the internet. Which solution meets these requirements?`,
      options: [
        `Create a VPC peering connection with each customer VPC.`,
        `Attach all customer VPCs to a shared AWS Transit Gateway.`,
        `Create a VPC endpoint service (AWS PrivateLink) for the NLB and have customers create interface endpoints in their VPCs.`,
        `Publish the API through a public Application Load Balancer restricted by security groups.`
      ],
      answer: [2],
      explanation: `<b>AWS PrivateLink</b> lets consumers reach the service through interface endpoints with private IPs in their own VPC, without routing between networks, so overlapping CIDRs are not a problem. VPC peering does not support overlapping CIDRs and would not scale to hundreds of connections. Transit Gateway also requires non-overlapping, routable CIDRs. A public ALB sends traffic over the internet, violating the requirement.`
    },
    {
      id: 'saa-007', domain: 'secure', lesson: 'vpc-networking', multi: false,
      question: `A company's web application in a public subnet is receiving malicious traffic from a specific range of IP addresses. The security team must block that range immediately for all instances in the subnet. What should a solutions architect do?`,
      options: [
        `Add inbound deny rules for the IP range to the network ACL associated with the subnet, numbered lower than the allow rules.`,
        `Add a deny rule for the IP range to the instances' security group.`,
        `Remove the route to the internet gateway from the subnet's route table.`,
        `Enable Amazon GuardDuty to block the IP range.`
      ],
      answer: [0],
      explanation: `<b>Network ACLs</b> support explicit deny rules and are evaluated in number order, so a low-numbered deny rule blocks the range for the whole subnet. Security groups support only allow rules, so you cannot deny an IP. Removing the IGW route takes the whole application offline. GuardDuty detects threats but does not block traffic by itself.`
    },
    {
      id: 'saa-008', domain: 'secure', lesson: 'data-protection', multi: false,
      question: `An application running on Amazon ECS connects to an Amazon RDS for MySQL database. Credentials are currently stored in a configuration file in the container image. The company requires that credentials be stored securely and rotated automatically every 30 days with the LEAST operational overhead. Which solution should be used?`,
      options: [
        `Store the credentials as a SecureString in SSM Parameter Store and write a cron job to update them.`,
        `Encrypt the configuration file with AWS KMS and rebuild the image monthly.`,
        `Store the credentials in an S3 bucket encrypted with SSE-KMS and rotate them with a Lambda function scheduled by EventBridge.`,
        `Store the credentials in AWS Secrets Manager with automatic rotation enabled, and have the application retrieve them at runtime.`
      ],
      answer: [3],
      explanation: `<b>Secrets Manager</b> provides built-in automatic rotation for RDS credentials and integrates with ECS task definitions, giving the least overhead. Parameter Store has no native rotation, so you would build and maintain it yourself. Rebuilding images monthly is manual and still embeds secrets in images. Storing secrets in S3 with custom Lambda rotation works but is significant custom code compared to the managed feature.`
    },
    {
      id: 'saa-009', domain: 'secure', lesson: 'data-protection', multi: false,
      question: `A company stores sensitive documents in Amazon S3. Compliance requires that the company control the encryption key's access policy, be able to disable the key, and have an audit record of every use of the key. Which encryption option meets these requirements with the LEAST operational effort?`,
      options: [
        `Server-side encryption with Amazon S3 managed keys (SSE-S3).`,
        `Server-side encryption with AWS KMS using a customer managed key (SSE-KMS).`,
        `Server-side encryption with customer-provided keys (SSE-C).`,
        `Client-side encryption using keys stored on the application servers.`
      ],
      answer: [1],
      explanation: `<b>SSE-KMS with a customer managed key</b> lets the company edit the key policy, disable the key, and see every encrypt/decrypt call in CloudTrail, while S3 still does the encryption. SSE-S3 keys are managed entirely by S3, with no key policy or per-use audit. SSE-C requires the company to manage and send keys with every request, which is much more effort and gives no KMS audit trail. Client-side encryption with keys on servers is the most operational effort and weakest key protection.`
    },
    {
      id: 'saa-010', domain: 'secure', lesson: 'data-protection', multi: false,
      question: `A financial services company must store its encryption keys in dedicated, single-tenant hardware security modules where only the company's administrators can manage the keys. AWS must not have access to the key material. Which service should be used?`,
      options: [
        `AWS KMS with AWS managed keys`,
        `AWS Secrets Manager`,
        `AWS CloudHSM`,
        `AWS Certificate Manager Private CA`
      ],
      answer: [2],
      explanation: `<b>AWS CloudHSM</b> provides dedicated single-tenant HSMs in your VPC where you exclusively manage users and keys. KMS is a managed multi-tenant service, and AWS managed keys give the customer no control at all. Secrets Manager stores secrets, not HSM-protected keys. ACM Private CA issues private certificates; it is not a dedicated HSM for customer keys.`
    },
    {
      id: 'saa-011', domain: 'secure', lesson: 'governance-threat-detection', multi: false,
      question: `A healthcare company has hundreds of S3 buckets created by different teams. The compliance officer needs to automatically discover which buckets contain personally identifiable information (PII) such as names and Social Security numbers. Which AWS service should be used?`,
      options: [
        `Amazon Macie`,
        `Amazon GuardDuty`,
        `Amazon Inspector`,
        `AWS Config`
      ],
      answer: [0],
      explanation: `<b>Amazon Macie</b> uses machine learning and pattern matching to discover sensitive data such as PII in S3. GuardDuty detects threats from logs (for example, unusual API calls), not data contents. Inspector scans EC2, container images and Lambda for software vulnerabilities. AWS Config evaluates resource configurations, such as whether a bucket is public, not the data inside objects.`
    },
    {
      id: 'saa-012', domain: 'secure', lesson: 'governance-threat-detection', multi: false,
      question: `A company's public web application runs on EC2 instances behind an Application Load Balancer. Security logs show repeated SQL injection attempts and a single IP sending thousands of requests per minute. Which solution provides protection with the LEAST operational overhead?`,
      options: [
        `Install a host-based intrusion prevention agent on every EC2 instance.`,
        `Use network ACLs to block each malicious IP as it is discovered.`,
        `Subscribe to AWS Shield Advanced and rely on it to block SQL injection.`,
        `Associate an AWS WAF web ACL with the ALB using the AWS managed SQL injection rule group and a rate-based rule.`
      ],
      answer: [3],
      explanation: `<b>AWS WAF</b> on the ALB with managed rule groups blocks SQL injection, and a <b>rate-based rule</b> automatically throttles IPs exceeding a request threshold. Host-based agents on every instance add significant management work. Manually updating NACLs is reactive and limited by rule count. Shield Advanced focuses on DDoS protection; SQL injection filtering is a WAF function.`
    },
    {
      id: 'saa-013', domain: 'secure', lesson: 'iam-fundamentals', multi: false,
      question: `A mobile app lets users sign in with their Google or Apple accounts. After sign-in, the app must upload photos directly to an S3 bucket, and each user must only be able to write to their own prefix. Which solution meets these requirements?`,
      options: [
        `Create an IAM user for each app user and embed the access keys in the app.`,
        `Use an Amazon Cognito user pool with social identity providers and a Cognito identity pool that issues temporary credentials from an IAM role whose policy uses the identity ID as a prefix variable.`,
        `Make the bucket public for writes and validate uploads with a Lambda function.`,
        `Use IAM Identity Center to federate the social identities.`
      ],
      answer: [1],
      explanation: `A <b>Cognito user pool</b> handles social sign-in, and a <b>Cognito identity pool</b> exchanges the token for temporary AWS credentials; a policy variable restricts each user to their own prefix. IAM users per app user do not scale and embedding keys in apps is insecure. Public write buckets are a serious security risk. IAM Identity Center is for workforce access to AWS accounts and business apps, not customer-facing mobile users.`
    },
    {
      id: 'saa-014', domain: 'secure', lesson: 'governance-threat-detection', multi: true,
      question: `A company serves static website content from an S3 bucket through Amazon CloudFront. Users must not be able to bypass CloudFront and access the objects directly from S3. Which combination of steps should a solutions architect take? (Choose TWO.)`,
      options: [
        `Configure an origin access control (OAC) on the CloudFront distribution for the S3 origin.`,
        `Enable S3 static website hosting and make the bucket public.`,
        `Update the bucket policy to allow s3:GetObject only for the CloudFront service principal with a condition matching the distribution's ARN, and keep Block Public Access enabled.`,
        `Enable S3 Transfer Acceleration on the bucket.`,
        `Require signed URLs for all requests to the S3 bucket endpoint.`
      ],
      answer: [0, 2],
      explanation: `With <b>OAC</b>, CloudFront signs its requests to S3, and the <b>bucket policy</b> allows reads only from the CloudFront service principal for that specific distribution, so the bucket remains private. A public website bucket lets anyone bypass CloudFront. Transfer Acceleration is for faster uploads and does nothing for access control. Signed URLs control which viewers can access content through CloudFront; they do not by themselves stop direct S3 access, and S3 does not natively validate CloudFront signed URLs.`
    },
    {
      id: 'saa-015', domain: 'secure', lesson: 'vpc-networking', multi: true,
      question: `A company needs a private, dedicated connection from its data center to AWS with consistent network performance for large daily data transfers. The security policy requires all traffic between the data center and AWS to be encrypted in transit. Which combination of solutions meets these requirements? (Choose TWO.)`,
      options: [
        `Provision an AWS Direct Connect connection.`,
        `Use only an AWS Site-to-Site VPN connection over the internet.`,
        `Establish an IPsec Site-to-Site VPN that runs over the Direct Connect connection.`,
        `Create a VPC peering connection to the data center.`,
        `Use AWS Global Accelerator to connect the data center to the VPC.`
      ],
      answer: [0, 2],
      explanation: `<b>Direct Connect</b> provides a private connection with consistent performance, but it is not encrypted by default, so running an <b>IPsec VPN over DX</b> adds encryption (MACsec is another option on supported dedicated connections). A VPN alone over the internet is encrypted but does not give consistent performance. VPC peering only connects VPCs, not on-premises networks. Global Accelerator improves internet routing to AWS endpoints for users; it is not a private site-to-site connection.`
    },
    {
      id: 'saa-016', domain: 'secure', lesson: 'governance-threat-detection', multi: true,
      question: `A company has enabled Amazon GuardDuty. When GuardDuty reports that an EC2 instance is communicating with a known cryptocurrency-mining command-and-control server, the company wants the instance to be isolated automatically by replacing its security group. Which combination of steps should be taken? (Choose TWO.)`,
      options: [
        `Configure GuardDuty to automatically terminate the instance.`,
        `Create an Amazon EventBridge rule that matches the specific GuardDuty finding type.`,
        `Enable Amazon Inspector to block the outbound traffic.`,
        `Configure AWS Config to delete the instance when the finding appears.`,
        `Set an AWS Lambda function as the rule's target to replace the instance's security group with an isolation security group.`
      ],
      answer: [1, 4],
      explanation: `GuardDuty publishes findings to <b>EventBridge</b>; a rule matching the finding type can invoke a <b>Lambda</b> function (or SSM Automation) to swap in an isolation security group. GuardDuty only detects; it has no built-in action to terminate instances. Inspector scans for vulnerabilities and does not block traffic. AWS Config evaluates configuration compliance and does not react to GuardDuty findings in this way.`
    },
    {
      id: 'saa-017', domain: 'secure', lesson: 'iam-fundamentals', multi: true,
      question: `A security audit found that the root user of a production AWS account has access keys and is used by several administrators for daily tasks. Which actions should a solutions architect recommend to follow AWS best practices? (Choose THREE.)`,
      options: [
        `Enable multi-factor authentication (MFA) on the root user.`,
        `Rotate the root user access keys every 90 days and share them through a password manager.`,
        `Give administrators their own identities through IAM Identity Center or IAM roles for daily work.`,
        `Delete the root user access keys.`,
        `Store the root password in SSM Parameter Store so all administrators can retrieve it.`
      ],
      answer: [0, 2, 3],
      explanation: `Best practice is to <b>enable MFA</b> on root, <b>delete root access keys</b>, and give administrators <b>individual identities</b> (Identity Center or roles) for daily work, reserving root for the few tasks that require it. Rotating and sharing root keys still leaves long-term, all-powerful credentials in use and removes accountability. Putting the root password in Parameter Store for many people is shared-credential use of the most privileged identity.`
    },
    {
      id: 'saa-018', domain: 'resilient', lesson: 'decoupling', multi: false,
      question: `An order processing application receives highly variable traffic. During sales, the web tier sends orders directly to backend processing servers, which become overloaded and drop orders. The company wants to ensure no orders are lost and the backend can scale independently. What should a solutions architect do?`,
      options: [
        `Increase the instance size of the backend servers.`,
        `Place an Amazon SNS topic between the tiers and subscribe the backend servers via HTTP.`,
        `Have the web tier send orders to an Amazon SQS queue, and scale the backend Auto Scaling group based on the queue backlog per instance.`,
        `Store orders in an Amazon ElastiCache cluster for the backend to read.`
      ],
      answer: [2],
      explanation: `An <b>SQS queue</b> durably buffers orders during spikes, and scaling consumers on <b>backlog per instance</b> lets the backend grow independently. Bigger instances still have a fixed ceiling and do not buffer. SNS pushes messages to HTTP subscribers; if they are overloaded, deliveries are retried but there is no durable work queue for consumers to pull from at their own pace. ElastiCache is an in-memory cache, not a durable message queue.`
    },
    {
      id: 'saa-019', domain: 'resilient', lesson: 'decoupling', multi: false,
      question: `A banking application publishes account transactions to a queue. Transactions for the same account must be processed in the exact order they were sent and must not be processed twice. Transactions for different accounts can be processed in parallel. Which solution meets these requirements?`,
      options: [
        `Use an Amazon SQS FIFO queue and set the message group ID to the account ID.`,
        `Use an Amazon SQS standard queue with a single consumer.`,
        `Use an Amazon SNS standard topic with message filtering by account ID.`,
        `Use an Amazon SQS standard queue with long polling enabled.`
      ],
      answer: [0],
      explanation: `An <b>SQS FIFO queue</b> preserves order within each <b>message group ID</b> and provides exactly-once processing; different groups are processed in parallel. A standard queue provides only best-effort ordering and at-least-once delivery, even with a single consumer. SNS standard topics do not guarantee ordering. Long polling reduces empty responses and cost but does not affect ordering or duplicates.`
    },
    {
      id: 'saa-020', domain: 'resilient', lesson: 'decoupling', multi: false,
      question: `When a new customer signs up, an application must notify three independent systems: a CRM integration, an email service, and an analytics pipeline. Each system processes messages at a different rate, and an outage in one must not affect the others. Which architecture is MOST appropriate?`,
      options: [
        `Have the application call each system's API synchronously in sequence.`,
        `Write the event to one SQS queue that all three systems poll.`,
        `Store the event in DynamoDB and have each system scan the table every minute.`,
        `Publish the event to an Amazon SNS topic with three SQS queues subscribed, one per system.`
      ],
      answer: [3],
      explanation: `The <b>SNS-to-SQS fan-out</b> pattern gives each system its own durable queue to consume at its own pace, isolating failures. Synchronous sequential calls tightly couple the systems, so one outage breaks signup. With a single shared SQS queue, each message is consumed by only one consumer, so the other systems miss it. Scanning DynamoDB on a schedule is inefficient, adds latency and requires custom tracking logic.`
    },
    {
      id: 'saa-021', domain: 'resilient', lesson: 'ha-databases', multi: false,
      question: `A company runs a production Amazon RDS for PostgreSQL database in a single Availability Zone. The business requires the database to survive an AZ failure automatically with no data loss and no application connection string changes. What should a solutions architect do?`,
      options: [
        `Create a read replica in another AZ and promote it manually when needed.`,
        `Convert the DB instance to a Multi-AZ deployment.`,
        `Take hourly snapshots and copy them to another AZ.`,
        `Migrate the database to an EC2 instance with an EBS volume replicated to another AZ.`
      ],
      answer: [1],
      explanation: `<b>RDS Multi-AZ</b> keeps a synchronously replicated standby in another AZ and fails over automatically, keeping the same DNS endpoint. A read replica uses asynchronous replication (possible data loss) and needs manual promotion with a new endpoint. Hourly snapshots can lose up to an hour of data and require a manual restore. EBS volumes are AZ-scoped and do not natively replicate to another AZ; self-managing the database adds overhead.`
    },
    {
      id: 'saa-022', domain: 'resilient', lesson: 'ha-databases', multi: false,
      question: `A global retailer runs its relational database on Amazon Aurora MySQL in us-east-1. It needs a disaster recovery solution in eu-west-1 with an RPO of about one second and an RTO of a few minutes, and wants local low-latency reads for European users. Which solution meets these requirements?`,
      options: [
        `Take Aurora snapshots every hour and copy them to eu-west-1.`,
        `Create an Aurora Replica in another Availability Zone in us-east-1.`,
        `Use Aurora Global Database with a secondary cluster in eu-west-1.`,
        `Use AWS DMS to replicate changes to an RDS MySQL instance in eu-west-1.`
      ],
      answer: [2],
      explanation: `<b>Aurora Global Database</b> replicates at the storage layer with typically under one second of lag, supports promoting the secondary Region quickly, and serves local reads. Hourly snapshots give an RPO of up to an hour and a long restore. An Aurora Replica in the same Region does not protect against a Regional outage. DMS replication works but adds operational overhead and typically higher lag than the built-in global database feature.`
    },
    {
      id: 'saa-023', domain: 'resilient', lesson: 'ha-databases', multi: false,
      question: `A gaming company's player profile service uses Amazon DynamoDB in one Region. The company is expanding to Europe and Asia and needs players in every Region to read and write their profiles with low latency, and the service must keep working if an entire Region fails. Which solution meets these requirements?`,
      options: [
        `Convert the table to DynamoDB global tables with replicas in each Region.`,
        `Enable DynamoDB Accelerator (DAX) in each Region.`,
        `Enable point-in-time recovery and restore the table into other Regions on demand.`,
        `Use DynamoDB Streams with Lambda to copy items to read-only tables in other Regions.`
      ],
      answer: [0],
      explanation: `<b>DynamoDB global tables</b> provide multi-Region, multi-active replication so each Region can read and write locally and continue during a Regional outage. DAX is a cache within a Region and does not replicate data across Regions. PITR restores are slow and manual, not continuous multi-Region availability. Custom stream-based copies to read-only tables would not allow local writes and add code to maintain.`
    },
    {
      id: 'saa-024', domain: 'resilient', lesson: 'disaster-recovery', multi: false,
      question: `A company's critical application must recover from a Regional failure within 10 minutes with minimal data loss. Management wants to keep DR costs lower than running full production capacity in two Regions. Which DR strategy should be used?`,
      options: [
        `Backup and restore`,
        `Pilot light`,
        `Multi-site active/active`,
        `Warm standby`
      ],
      answer: [3],
      explanation: `<b>Warm standby</b> keeps a scaled-down but fully functional copy running in the DR Region, so it can take traffic and scale up within minutes at a lower cost than full duplication. Backup and restore typically takes hours. Pilot light keeps only data replicated with app servers off, so provisioning and starting the stack usually takes longer than a tightly bounded 10-minute RTO allows. Multi-site active/active meets the RTO but is the most expensive option, which management wants to avoid.`
    },
    {
      id: 'saa-025', domain: 'resilient', lesson: 'disaster-recovery', multi: false,
      question: `An internal reporting application has an RTO of 24 hours and an RPO of 12 hours. The company wants the MOST cost-effective disaster recovery approach in a second Region. What should a solutions architect recommend?`,
      options: [
        `Run a scaled-down copy of the application continuously in the second Region.`,
        `Use AWS Backup to take scheduled backups with cross-Region copy, and keep infrastructure as code templates to rebuild the environment when needed.`,
        `Deploy the application in both Regions behind Route 53 latency-based routing.`,
        `Keep a cross-Region read replica of the database and pre-provisioned stopped EC2 instances.`
      ],
      answer: [1],
      explanation: `With RTO and RPO measured in many hours, <b>backup and restore</b> using AWS Backup cross-Region copies plus IaC is the cheapest option that meets the objectives. A running scaled-down copy (warm standby) and active/active deployments cost far more than needed. A continuously running read replica (pilot light) also adds ongoing cost that these relaxed objectives do not justify.`
    },
    {
      id: 'saa-026', domain: 'resilient', lesson: 'ha-compute-routing', multi: false,
      question: `A company hosts its website on EC2 instances behind an ALB in us-west-2. It wants a static "service temporarily unavailable" page hosted in Amazon S3 to be shown automatically if the primary site becomes unhealthy. Which solution meets this requirement with the LEAST effort?`,
      options: [
        `Use Route 53 weighted routing with 100% weight on the ALB and 0% on the S3 website.`,
        `Use Route 53 geolocation routing to send users to S3.`,
        `Use Route 53 failover routing with a health-checked primary alias record for the ALB and a secondary alias record for the S3 static website.`,
        `Configure the ALB to redirect to S3 when CPU utilization is high.`
      ],
      answer: [2],
      explanation: `<b>Failover routing</b> returns the primary record while its health check passes and automatically switches to the secondary (the S3 static site) when it fails. Weighted routing with 0% would not send traffic to S3 even when the primary is unhealthy unless weights are changed manually. Geolocation routes by user location, not health. ALB redirects based on CPU are not a supported health-based failover mechanism.`
    },
    {
      id: 'saa-027', domain: 'resilient', lesson: 'ha-compute-routing', multi: false,
      question: `An application runs on EC2 instances in an Auto Scaling group behind an Application Load Balancer. Sometimes the application process hangs; the ALB marks the instance unhealthy, but the instance is never replaced. What should a solutions architect do?`,
      options: [
        `Change the Auto Scaling group health check type to include ELB health checks.`,
        `Increase the ALB health check interval.`,
        `Enable cross-zone load balancing on the ALB.`,
        `Add a scheduled scaling action to replace instances every hour.`
      ],
      answer: [0],
      explanation: `By default an ASG uses only EC2 status checks, which pass while the OS is running. Enabling <b>ELB health checks</b> on the ASG makes it replace instances that fail the load balancer's application-level check. A longer health check interval only slows detection. Cross-zone load balancing distributes traffic but does not replace instances. Hourly scheduled replacement is wasteful and leaves users affected until the next cycle.`
    },
    {
      id: 'saa-028', domain: 'resilient', lesson: 'vpc-networking', multi: false,
      question: `A company has 50 VPCs across several accounts in one Region and two on-premises data centers connected with Site-to-Site VPN. All VPCs must communicate with each other and with both data centers, and the network team wants to minimize the number of connections to manage. Which solution meets these requirements?`,
      options: [
        `Create a full mesh of VPC peering connections and a VPN connection from each VPC to each data center.`,
        `Use AWS PrivateLink between every pair of VPCs.`,
        `Create a transit VPC with EC2-based routers in a single instance.`,
        `Deploy an AWS Transit Gateway, share it with the accounts using AWS RAM, attach all VPCs, and terminate the VPN connections on the Transit Gateway.`
      ],
      answer: [3],
      explanation: `A <b>Transit Gateway</b> acts as a Regional hub with transitive routing between all attached VPCs and VPNs, shared across accounts with RAM. A full peering mesh would need over 1,200 peering connections plus per-VPC VPNs, and peering is non-transitive. PrivateLink exposes specific services, not full network connectivity. A single EC2 router is a single point of failure and adds operational burden.`
    },
    {
      id: 'saa-029', domain: 'resilient', lesson: 'ha-compute-routing', multi: true,
      question: `A company runs a web application on a single large EC2 instance. The company wants the application to remain available if an instance or an entire Availability Zone fails. Which combination of steps should a solutions architect take? (Choose TWO.)`,
      options: [
        `Move to an even larger instance type with more memory.`,
        `Create an Auto Scaling group that spans at least two Availability Zones.`,
        `Launch the instances in a cluster placement group.`,
        `Place an Application Load Balancer in front of the Auto Scaling group with subnets in the same Availability Zones.`,
        `Take daily AMIs of the instance and copy them to another Region.`
      ],
      answer: [1, 3],
      explanation: `An <b>Auto Scaling group across multiple AZs</b> replaces failed instances and keeps capacity in surviving AZs, and an <b>ALB</b> spreads traffic and routes only to healthy targets. A larger instance is still a single point of failure. A cluster placement group places instances in a single AZ, which reduces AZ resilience. Daily AMIs help with backups but do not provide automatic availability.`
    },
    {
      id: 'saa-030', domain: 'resilient', lesson: 'decoupling', multi: true,
      question: `A Lambda function processes messages from an Amazon SQS standard queue. Some malformed messages cause the function to fail repeatedly, and these messages keep reappearing and blocking resources. Occasionally, valid messages are processed twice because processing takes longer than expected. Which combination of actions should a solutions architect take? (Choose TWO.)`,
      options: [
        `Configure a dead-letter queue on the source queue with an appropriate maxReceiveCount in the redrive policy.`,
        `Convert the queue to an SNS topic.`,
        `Reduce the queue's message retention period to 1 minute.`,
        `Decrease the Lambda function timeout to 1 second.`,
        `Set the queue visibility timeout to at least six times the Lambda function timeout.`
      ],
      answer: [0, 4],
      explanation: `A <b>dead-letter queue</b> moves messages aside after they fail maxReceiveCount times, so poison messages stop recirculating. Setting the <b>visibility timeout</b> well above processing time (AWS recommends at least six times the function timeout for Lambda event sources) prevents messages from becoming visible again mid-processing and being processed twice. SNS does not queue messages for retry in the same way. Reducing retention to 1 minute would lose valid messages. Shortening the Lambda timeout would cause more failures, not fewer.`
    },
    {
      id: 'saa-031', domain: 'resilient', lesson: 's3-storage-classes', multi: true,
      question: `A media company stores master video files in an S3 bucket in us-east-1. The files must be protected from accidental overwrites and deletions, and a copy must be available in another Region in case of a Regional outage. Which combination of steps meets these requirements? (Choose TWO.)`,
      options: [
        `Enable S3 Transfer Acceleration on the bucket.`,
        `Enable S3 Versioning on the source bucket (and the destination bucket).`,
        `Move the objects to S3 One Zone-IA.`,
        `Enable S3 Inventory reports.`,
        `Configure S3 Cross-Region Replication to a bucket in another Region.`
      ],
      answer: [1, 4],
      explanation: `<b>Versioning</b> preserves previous versions so overwrites and deletes can be recovered, and it is a prerequisite for <b>Cross-Region Replication</b>, which keeps a copy in another Region. Transfer Acceleration speeds uploads but provides no protection. One Zone-IA stores data in a single AZ, reducing resilience. S3 Inventory only lists objects and metadata.`
    },
    {
      id: 'saa-032', domain: 'performance', lesson: 'ha-databases', multi: false,
      question: `An e-commerce application uses Amazon RDS for MySQL. Product catalog reads account for 90% of database traffic and are causing high CPU on the DB instance during peak hours. Reads can tolerate data that is a few seconds old. What is the MOST effective way to improve performance?`,
      options: [
        `Enable Multi-AZ on the DB instance.`,
        `Switch the storage to Provisioned IOPS SSD.`,
        `Enable RDS automated backups during peak hours.`,
        `Create one or more read replicas and direct catalog read queries to them.`
      ],
      answer: [3],
      explanation: `<b>Read replicas</b> offload read traffic using asynchronous replication, which suits reads that tolerate slight staleness. Standard Multi-AZ standbys do not serve reads, so they do not reduce load. The bottleneck is CPU, not storage IOPS, so Provisioned IOPS would not help. Backups do not improve performance and can add I/O load.`
    },
    {
      id: 'saa-033', domain: 'performance', lesson: 'caching-edge', multi: false,
      question: `A real-time bidding application stores data in Amazon DynamoDB. Read latency must drop from single-digit milliseconds to microseconds for frequently read items, with minimal application code changes. Which solution meets these requirements?`,
      options: [
        `Add a DynamoDB Accelerator (DAX) cluster in front of the table.`,
        `Increase the table's provisioned read capacity units.`,
        `Enable DynamoDB global tables.`,
        `Place Amazon CloudFront in front of the DynamoDB table.`
      ],
      answer: [0],
      explanation: `<b>DAX</b> is an API-compatible in-memory cache for DynamoDB that delivers microsecond reads with minimal code changes. More read capacity improves throughput, not the base latency. Global tables replicate across Regions but do not change per-request latency to microseconds. CloudFront caches HTTP content and cannot sit directly in front of DynamoDB API calls.`
    },
    {
      id: 'saa-034', domain: 'performance', lesson: 'caching-edge', multi: false,
      question: `A mobile game needs a real-time leaderboard that ranks millions of players by score, with sub-millisecond updates and queries for the top 100 players. The data must survive the failure of a cache node. Which solution is MOST suitable?`,
      options: [
        `Amazon ElastiCache for Memcached`,
        `Amazon RDS for MySQL with an index on the score column`,
        `Amazon ElastiCache for Valkey (or Redis OSS) with replication and Multi-AZ, using sorted sets`,
        `Amazon S3 with S3 Select queries`
      ],
      answer: [2],
      explanation: `<b>ElastiCache for Valkey/Redis OSS</b> provides <b>sorted sets</b>, purpose-built for leaderboards, with replication and Multi-AZ failover for resilience. Memcached lacks sorted sets, replication and persistence. A relational database can rank with indexes, but not at sub-millisecond latency under heavy write load. S3 is object storage with far higher latency and is not designed for this.`
    },
    {
      id: 'saa-035', domain: 'performance', lesson: 'caching-edge', multi: false,
      question: `A news website hosted on EC2 behind an ALB in us-east-1 has a rapidly growing audience in Asia and Europe. Users report slow page loads, especially for images and stylesheets. The company wants to improve performance with the LEAST operational overhead. What should a solutions architect do?`,
      options: [
        `Deploy copies of the full application stack in Asia and Europe.`,
        `Create an Amazon CloudFront distribution with the ALB as origin and appropriate cache behaviors for static assets.`,
        `Increase the size of the EC2 instances.`,
        `Use Route 53 geolocation routing to the us-east-1 ALB.`
      ],
      answer: [1],
      explanation: `<b>CloudFront</b> caches static assets at edge locations near users and accelerates dynamic requests over the AWS backbone with little operational effort. Deploying full stacks in multiple Regions adds significant cost and complexity. Larger instances do not reduce network distance. Geolocation routing to the same single ALB changes nothing for latency.`
    },
    {
      id: 'saa-036', domain: 'performance', lesson: 'caching-edge', multi: false,
      question: `A multiplayer game uses a custom UDP protocol, with servers behind Network Load Balancers in two Regions. Players worldwide need the lowest possible latency, and partners require a fixed set of IP addresses to allow-list. Failover between Regions must occur within seconds. Which solution meets these requirements?`,
      options: [
        `Amazon CloudFront with the NLBs as origins`,
        `Route 53 latency-based routing with a low TTL`,
        `An Application Load Balancer in each Region with Elastic IPs`,
        `AWS Global Accelerator with endpoint groups for both NLBs`
      ],
      answer: [3],
      explanation: `<b>Global Accelerator</b> provides two static anycast IPs, supports UDP, routes users onto the AWS backbone at the nearest edge, and fails over between Regions in seconds based on health checks. CloudFront is for HTTP(S), not custom UDP. Route 53 latency routing depends on DNS caching for failover and does not provide fixed IPs. ALBs do not support UDP or Elastic IPs.`
    },
    {
      id: 'saa-037', domain: 'performance', lesson: 'storage-performance', multi: false,
      question: `A content management system runs on Linux EC2 instances in an Auto Scaling group across three Availability Zones. All instances need concurrent read/write access to the same set of files, and storage should grow and shrink automatically. Which storage solution should be used?`,
      options: [
        `Amazon EFS file system mounted on all instances`,
        `An EBS gp3 volume attached to each instance`,
        `An EBS io2 volume with Multi-Attach enabled`,
        `Instance store volumes synchronized with rsync`
      ],
      answer: [0],
      explanation: `<b>Amazon EFS</b> is a shared, elastic NFS file system accessible from instances in multiple AZs at the same time. Separate EBS volumes per instance are not shared. io2 Multi-Attach works only within a single AZ and requires a cluster-aware file system. Instance store is ephemeral, and syncing with rsync is fragile and operationally heavy.`
    },
    {
      id: 'saa-038', domain: 'performance', lesson: 'storage-performance', multi: false,
      question: `A company is migrating a Windows-based application to AWS. The application stores files on SMB shares and relies on Active Directory for file permissions. The company wants a fully managed, highly available solution. Which service should be used?`,
      options: [
        `Amazon EFS with Multi-AZ`,
        `Amazon S3 with S3 File Gateway`,
        `Amazon FSx for Windows File Server with a Multi-AZ deployment`,
        `Amazon FSx for Lustre`
      ],
      answer: [2],
      explanation: `<b>FSx for Windows File Server</b> provides native SMB shares, NTFS permissions and Active Directory integration, and a Multi-AZ deployment gives high availability. EFS supports NFS for Linux, not SMB with Windows ACLs. S3 File Gateway is a hybrid on-premises appliance for writing files to S3, not a native Windows file server in AWS. FSx for Lustre targets Linux HPC workloads.`
    },
    {
      id: 'saa-039', domain: 'performance', lesson: 'storage-performance', multi: false,
      question: `A research team runs short-lived machine learning training jobs on hundreds of EC2 instances. The training data, several hundred terabytes, is stored in Amazon S3. Jobs need a high-performance POSIX file system with very high throughput, and results must be written back to S3. Which solution is MOST appropriate?`,
      options: [
        `Mount the S3 bucket on each instance using S3 File Gateway.`,
        `Create an Amazon FSx for Lustre file system linked to the S3 bucket.`,
        `Copy the data to EBS st1 volumes on each instance.`,
        `Use Amazon EFS in Bursting throughput mode.`
      ],
      answer: [1],
      explanation: `<b>FSx for Lustre</b> delivers very high throughput for HPC and ML, and its S3 integration lazy-loads data from the bucket and exports results back. S3 File Gateway is designed for on-premises access and is not built for this kind of parallel throughput. Copying hundreds of TB to EBS volumes on every instance is slow and expensive. EFS is a general-purpose shared file system and Bursting mode would not sustain the required throughput.`
    },
    {
      id: 'saa-040', domain: 'performance', lesson: 'storage-performance', multi: false,
      question: `A company runs a high-transaction Oracle database on EC2. The database needs sustained very high IOPS with consistent sub-millisecond latency, well beyond what general purpose SSD volumes provide. Which EBS volume type should be used?`,
      options: [
        `gp2`,
        `st1`,
        `sc1`,
        `io2 Block Express`
      ],
      answer: [3],
      explanation: `<b>io2 Block Express</b> is the Provisioned IOPS SSD option designed for the most demanding databases, with the highest IOPS, consistent sub-millisecond latency and high durability. gp2 is general purpose with IOPS tied to volume size. st1 and sc1 are HDD volumes optimized for throughput or cold data, unsuitable for random-I/O databases and not usable as boot volumes.`
    },
    {
      id: 'saa-041', domain: 'performance', lesson: 'storage-performance', multi: false,
      question: `Users across the world upload large video files, often several gigabytes each, to a single S3 bucket in us-east-1. Uploads from distant locations are slow and sometimes fail midway, requiring a full restart. Which combination of features BEST improves upload speed and reliability?`,
      options: [
        `Enable S3 Transfer Acceleration and use multipart uploads.`,
        `Enable S3 Versioning and Cross-Region Replication.`,
        `Use S3 One Zone-IA and byte-range fetches.`,
        `Put CloudFront in front of the bucket with a long cache TTL.`
      ],
      answer: [0],
      explanation: `<b>Transfer Acceleration</b> routes uploads through the nearest edge location onto the AWS backbone, and <b>multipart upload</b> sends parts in parallel and retries only failed parts. Versioning and CRR protect data but do not speed uploads. One Zone-IA is a storage class and byte-range fetches help downloads, not uploads. CloudFront caching TTLs apply to downloads, not to accelerating large uploads to one bucket.`
    },
    {
      id: 'saa-042', domain: 'performance', lesson: 'compute-serverless', multi: false,
      question: `A company runs a tightly coupled computational fluid dynamics simulation across 64 EC2 instances. Nodes exchange data constantly and the job is very sensitive to network latency between instances. How should the instances be deployed?`,
      options: [
        `In a spread placement group across three Availability Zones`,
        `In a partition placement group with one instance per partition`,
        `In a cluster placement group in a single Availability Zone, using instances that support Elastic Fabric Adapter`,
        `In an Auto Scaling group spanning multiple Regions`
      ],
      answer: [2],
      explanation: `A <b>cluster placement group</b> packs instances close together in one AZ for the lowest latency and highest throughput, and <b>EFA</b> further accelerates tightly coupled HPC traffic. Spread placement groups maximize hardware separation (and are limited to seven running instances per AZ), increasing latency. Partition groups are for large distributed systems that need rack isolation. Multi-Region deployments add significant latency.`
    },
    {
      id: 'saa-043', domain: 'performance', lesson: 'compute-serverless', multi: true,
      question: `A startup is building a REST API for a mobile app. Traffic is unpredictable, ranging from zero requests at night to thousands of requests per second during marketing campaigns. The team wants to avoid managing servers and pay only for what it uses. Which combination of services should a solutions architect recommend? (Choose TWO.)`,
      options: [
        `Amazon EC2 instances in an Auto Scaling group`,
        `Amazon API Gateway`,
        `AWS Lambda`,
        `Amazon ECS on EC2 container instances`,
        `A self-managed Apache Kafka cluster`
      ],
      answer: [1, 2],
      explanation: `<b>API Gateway</b> with <b>Lambda</b> scales automatically from zero to high traffic, requires no servers to manage, and bills per request. EC2 Auto Scaling groups and ECS on EC2 require managing instances and keep paying for minimum capacity. A self-managed Kafka cluster is a streaming platform with heavy operational overhead and is not an API front end.`
    },
    {
      id: 'saa-044', domain: 'performance', lesson: 'databases-analytics', multi: true,
      question: `A company stores application logs in JSON format in Amazon S3. Analysts occasionally need to run SQL queries against the logs. The company wants to avoid provisioning or managing any infrastructure and to reduce the cost of each query. Which combination of steps should be taken? (Choose TWO.)`,
      options: [
        `Query the data with Amazon Athena.`,
        `Load the logs into a provisioned Amazon Redshift cluster that runs 24/7.`,
        `Launch a long-running Amazon EMR cluster with Hive.`,
        `Use an AWS Glue crawler to catalog the data, and convert it to partitioned Parquet with a Glue job.`,
        `Import the logs into Amazon RDS for PostgreSQL.`
      ],
      answer: [0, 3],
      explanation: `<b>Athena</b> runs serverless SQL directly on S3, and the <b>Glue Data Catalog</b> plus conversion to <b>partitioned Parquet</b> reduces data scanned, lowering the cost per query. A provisioned Redshift cluster and a long-running EMR cluster are infrastructure that runs and costs money even when idle, which is unnecessary for occasional queries. RDS is not designed for large log analytics and requires loading and managing a database.`
    },
    {
      id: 'saa-045', domain: 'performance', lesson: 'decoupling', multi: false,
      question: `A company collects clickstream events from its website and wants to deliver them into Amazon S3 in Parquet format for later analysis. Data can arrive in S3 within a few minutes, and the company does not want to write or manage consumer applications. Which solution meets these requirements?`,
      options: [
        `Amazon Kinesis Data Streams with a fleet of EC2 consumers using the Kinesis Client Library`,
        `Amazon Data Firehose with record format conversion to Parquet and an S3 destination`,
        `Amazon SQS with a Lambda function that writes each message to S3`,
        `Amazon SNS with an S3 subscription`
      ],
      answer: [1],
      explanation: `<b>Amazon Data Firehose</b> is fully managed, buffers streaming data and delivers it to S3 in near real time, with built-in conversion to Parquet. Kinesis Data Streams with custom KCL consumers requires writing and operating consumer applications. SQS with Lambda writing one object per message creates many small files and custom code. SNS cannot deliver directly to S3.`
    },
    {
      id: 'saa-046', domain: 'cost', lesson: 'ec2-purchasing', multi: false,
      question: `A company runs a steady-state workload 24/7 on EC2 and expects to keep this level of usage for three years. Over that time it plans to change instance families, move some workloads to another Region, and migrate parts of the application to AWS Fargate and AWS Lambda. Which purchasing option provides the greatest savings while supporting these changes?`,
      options: [
        `Compute Savings Plans with a 3-year term`,
        `Standard Reserved Instances with a 3-year term`,
        `EC2 Instance Savings Plans with a 3-year term`,
        `Spot Instances`
      ],
      answer: [0],
      explanation: `<b>Compute Savings Plans</b> apply across instance families, sizes, Regions and operating systems, and also cover Fargate and Lambda. Standard RIs are locked to specific instance attributes and do not apply to Fargate or Lambda. EC2 Instance Savings Plans are locked to one family in one Region and do not cover Fargate or Lambda. Spot Instances can be interrupted and are unsuitable for steady production that must stay up.`
    },
    {
      id: 'saa-047', domain: 'cost', lesson: 'ec2-purchasing', multi: false,
      question: `A media company runs nightly image rendering jobs. Each job is split into many independent tasks that checkpoint progress to Amazon S3, so interrupted tasks can be restarted. The jobs must finish by morning but can run at any time overnight. What is the MOST cost-effective compute option?`,
      options: [
        `On-Demand Instances`,
        `Dedicated Hosts`,
        `Spot Instances using an EC2 Fleet diversified across multiple instance types and Availability Zones`,
        `3-year All Upfront Reserved Instances`
      ],
      answer: [2],
      explanation: `The tasks are fault-tolerant and flexible, which is the ideal profile for <b>Spot Instances</b>, offering up to 90% savings; diversifying across instance types and AZs reduces interruption impact. On-Demand works but costs much more. Dedicated Hosts are a premium option for licensing or compliance needs. Reserved Instances bill for every hour of the term even though the jobs run only part of each day.`
    },
    {
      id: 'saa-048', domain: 'cost', lesson: 'ec2-purchasing', multi: false,
      question: `A company is moving a database server to AWS and wants to keep using its existing database licenses, which are licensed per physical CPU socket and core. The licensing terms require visibility into the physical server. Which EC2 option should be used?`,
      options: [
        `Dedicated Instances`,
        `On-Demand Instances with a Compute Savings Plan`,
        `Spot Instances`,
        `Dedicated Hosts`
      ],
      answer: [3],
      explanation: `<b>Dedicated Hosts</b> give you a physical server with visibility of sockets and cores, which is required for many bring-your-own-license (BYOL) terms. Dedicated Instances run on dedicated hardware but do not provide host-level visibility or control. Shared-tenancy On-Demand instances (even with a Savings Plan) do not meet per-socket licensing requirements. Spot Instances are shared tenancy and can be interrupted.`
    },
    {
      id: 'saa-049', domain: 'cost', lesson: 's3-storage-classes', multi: false,
      question: `A company stores user-generated content in Amazon S3. Some objects are accessed heavily for a few days and then rarely, while others become popular again months later. Access patterns are impossible to predict. The company wants to minimize storage costs without impacting performance or paying retrieval fees. Which storage class should be used?`,
      options: [
        `S3 Standard-IA`,
        `S3 Intelligent-Tiering`,
        `S3 One Zone-IA`,
        `S3 Glacier Flexible Retrieval`
      ],
      answer: [1],
      explanation: `<b>S3 Intelligent-Tiering</b> automatically moves objects between access tiers based on actual usage with no retrieval fees and no performance impact for the frequent and infrequent tiers, ideal for unpredictable patterns. Standard-IA and One Zone-IA charge retrieval fees, which add up when objects become popular again, and One Zone-IA reduces resilience. Glacier Flexible Retrieval requires minutes to hours to restore, impacting performance.`
    },
    {
      id: 'saa-050', domain: 'cost', lesson: 's3-storage-classes', multi: false,
      question: `A company generates audit logs that are accessed frequently for the first 90 days and almost never afterward. Regulations require keeping the logs for 7 years, after which they should be deleted. Retrieval within 48 hours is acceptable for older logs. What is the MOST cost-effective solution?`,
      options: [
        `Store the logs in S3 Standard for 7 years.`,
        `Store the logs in S3 Intelligent-Tiering and delete them manually after 7 years.`,
        `Store the logs in S3 One Zone-IA and transition them to S3 Glacier Instant Retrieval after 90 days.`,
        `Create an S3 Lifecycle rule to transition objects to S3 Glacier Deep Archive after 90 days and expire them after 7 years.`
      ],
      answer: [3],
      explanation: `A <b>lifecycle rule to Glacier Deep Archive</b> after 90 days gives the lowest storage cost for long-term retention, and retrieval within 12–48 hours is acceptable; an expiration action removes them automatically at 7 years. S3 Standard for 7 years is far more expensive. Intelligent-Tiering adds per-object monitoring fees and manual deletion adds overhead. One Zone-IA risks data loss in an AZ failure, and Glacier Instant Retrieval costs more than Deep Archive when millisecond access is not needed.`
    },
    {
      id: 'saa-051', domain: 'cost', lesson: 'cost-tools-transfer', multi: false,
      question: `A company's AWS bill shows very high NAT gateway data processing charges. Investigation shows that EC2 instances in private subnets download several terabytes per day from Amazon S3 and write to Amazon DynamoDB in the same Region. How can the company reduce these costs with the LEAST effort?`,
      options: [
        `Create gateway VPC endpoints for S3 and DynamoDB and add them to the private subnets' route tables.`,
        `Replace the NAT gateway with a NAT instance on a larger EC2 instance type.`,
        `Move the instances into public subnets with public IP addresses.`,
        `Create interface VPC endpoints for S3 and DynamoDB in every Availability Zone.`
      ],
      answer: [0],
      explanation: `<b>Gateway endpoints</b> for S3 and DynamoDB are free and route that traffic privately, bypassing the NAT gateway and its per-GB charges. A NAT instance shifts the cost into a self-managed instance that is a bottleneck and single point of failure. Public subnets weaken security. Interface endpoints would also bypass NAT but carry hourly and per-GB charges, so they cost more than gateway endpoints.`
    },
    {
      id: 'saa-052', domain: 'cost', lesson: 'cost-tools-transfer', multi: false,
      question: `The finance team wants to be notified by email when the company's projected monthly AWS spend is expected to exceed 20,000 USD, so it can act before the month ends. Which solution meets this requirement with the LEAST effort?`,
      options: [
        `Use AWS Cost Explorer to review the forecast every day.`,
        `Enable AWS Trusted Advisor cost optimization checks.`,
        `Create an AWS Budgets cost budget of 20,000 USD with an alert on forecasted spend that notifies the finance team by email.`,
        `Create a CloudWatch alarm on the EstimatedCharges metric that triggers at 20,000 USD.`
      ],
      answer: [2],
      explanation: `<b>AWS Budgets</b> supports alerts on <b>forecasted</b> cost and sends email or SNS notifications automatically. Reviewing Cost Explorer daily is manual. Trusted Advisor recommends optimizations but does not alert on spending thresholds. A CloudWatch billing alarm on EstimatedCharges fires on actual accrued charges, not on a forecast, so it would only alert after the money is spent.`
    },
    {
      id: 'saa-053', domain: 'cost', lesson: 'cost-tools-transfer', multi: false,
      question: `A company suspects many of its EC2 instances and EBS volumes are over-provisioned. It wants data-driven recommendations for the optimal instance types and volume configurations based on actual utilization. Which service should be used?`,
      options: [
        `AWS Budgets`,
        `AWS Compute Optimizer`,
        `AWS Cost and Usage Report`,
        `AWS Pricing Calculator`
      ],
      answer: [1],
      explanation: `<b>AWS Compute Optimizer</b> analyzes utilization metrics with machine learning and recommends right-sized EC2 instances, Auto Scaling groups, EBS volumes, Lambda functions and more. Budgets tracks spend against thresholds. The Cost and Usage Report provides detailed billing data but no right-sizing recommendations. The Pricing Calculator estimates costs for planned architectures.`
    },
    {
      id: 'saa-054', domain: 'cost', lesson: 'migration-transfer', multi: false,
      question: `A company must migrate 500 TB of archived data from its data center to Amazon S3 within three weeks. The data center has a 1 Gbps internet connection that is already heavily used during business hours. What is the MOST cost-effective and timely approach?`,
      options: [
        `Use AWS DataSync over the existing internet connection.`,
        `Order an AWS Direct Connect 10 Gbps dedicated connection.`,
        `Upload the data with S3 Transfer Acceleration.`,
        `Order multiple AWS Snowball Edge Storage Optimized devices and ship the data to AWS.`
      ],
      answer: [3],
      explanation: `500 TB over a fully dedicated 1 Gbps link would take roughly 46 days, far exceeding three weeks, and the link is already busy. Multiple <b>Snowball Edge</b> devices move the data offline within the window. DataSync and Transfer Acceleration are still limited by the same saturated internet link. A new Direct Connect connection can take weeks to provision and is costly for a one-time transfer.`
    },
    {
      id: 'saa-055', domain: 'cost', lesson: 'migration-transfer', multi: true,
      question: `A company wants to migrate a production on-premises Oracle database to Amazon Aurora PostgreSQL to reduce licensing costs. The database must remain available to users during the migration, with minimal downtime at cutover. Which combination of steps should be taken? (Choose TWO.)`,
      options: [
        `Use AWS DMS with a full load plus change data capture (CDC) task to migrate and continuously replicate data.`,
        `Ship the database files on an AWS Snowball Edge device and attach them to Aurora.`,
        `Use AWS DataSync to copy the Oracle data files to Amazon S3.`,
        `Convert the schema and code objects with AWS DMS Schema Conversion or the AWS Schema Conversion Tool.`,
        `Take a full export of the Oracle database each night and import it into Aurora.`
      ],
      answer: [0, 3],
      explanation: `This is a heterogeneous migration, so the schema and code must first be converted with <b>DMS Schema Conversion</b> (or SCT), then <b>DMS full load + CDC</b> keeps Aurora in sync while the source stays online, minimizing cutover downtime. Oracle data files cannot be attached to Aurora PostgreSQL, whether shipped on Snowball or copied with DataSync. Nightly exports cause up to a day of lag and long imports, not minimal downtime.`
    },
    {
      id: 'saa-056', domain: 'cost', lesson: 'cost-tools-transfer', multi: true,
      question: `A company wants to reduce the cost of its development and test environments. Developers work only during business hours on weekdays, the CI system runs fault-tolerant build jobs, and an audit found many unused EBS resources. Which actions will reduce costs? (Choose THREE.)`,
      options: [
        `Automatically stop development EC2 instances outside business hours, for example with AWS Instance Scheduler.`,
        `Purchase 3-year All Upfront Reserved Instances for the development instances.`,
        `Run the CI build agents on Spot Instances.`,
        `Migrate development EBS volumes from gp3 to io2 Block Express.`,
        `Delete unattached EBS volumes and obsolete snapshots.`
      ],
      answer: [0, 2, 4],
      explanation: `<b>Stopping instances outside business hours</b> eliminates more than two-thirds of weekly compute hours, <b>Spot</b> suits fault-tolerant CI jobs at a large discount, and <b>deleting unattached volumes and old snapshots</b> removes pure waste. 3-year RIs bill for every hour of the term, which is wasteful for instances that run only during business hours. io2 Block Express costs more than gp3 and is unnecessary for development workloads.`
    },
    {
      id: 'saa-057', domain: 'cost', lesson: 'migration-transfer', multi: false,
      question: `After an initial bulk migration, a company needs to copy new and changed files from an on-premises NFS server to Amazon S3 every night over its existing Direct Connect link. The solution should handle scheduling, encryption in transit and data integrity verification with minimal custom scripting. Which service should be used?`,
      options: [
        `AWS Snowball Edge`,
        `AWS DataSync`,
        `AWS Transfer Family`,
        `AWS Database Migration Service`
      ],
      answer: [1],
      explanation: `<b>AWS DataSync</b> is designed for online, scheduled transfers from NFS/SMB to S3, EFS or FSx, with built-in encryption, integrity checks and incremental copies. Snowball Edge is for offline bulk transfers, not nightly syncs. Transfer Family provides SFTP/FTPS/FTP endpoints for external users to push files; it does not pull from an NFS server on a schedule. DMS migrates databases, not file systems.`
    }
  ]
};
