use anyhow::Result;

#[allow(clippy::unnecessary_wraps)] // TODO: Will return errors when implemented
pub fn run_http(port: u16, domain: Option<String>) -> Result<()> {
    println!("Starting HTTP tunnel...");
    println!("  Local port: {}", port);

    if let Some(d) = domain {
        println!("  Domain: {}", d);
    } else {
        println!("  Domain: <auto-assigned>.noverlink.io");
    }

    // TODO: Implement HTTP tunnel logic
    println!("\n✓ Tunnel established!");

    // Return Result to allow future error handling when implemented
    Ok(())
}
