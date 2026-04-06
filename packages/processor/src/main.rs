use anyhow::{Context, Result};
use relay::{init_tracing, run, Config};

#[tokio::main]
async fn main() -> Result<()> {
    dotenvy::dotenv().ok();
    init_tracing()?;
    
    let config = Config::from_env()
        .context("failed to load configuration")?;
    
    tracing::info!(
        agent_port = config.agent_port,
        http_port = config.http_port,
        "configuration loaded"
    );
    
    run().await
}
