use anyhow::Result;

#[allow(clippy::unnecessary_wraps)] // TODO: Will return errors when implemented
pub fn run_status() -> Result<()> {
    println!("Active tunnels:");
    // TODO: Implement status logic
    println!("  (no active tunnels)");

    Ok(())
}

#[allow(clippy::unnecessary_wraps)] // TODO: Will return errors when implemented
pub fn run_kill() -> Result<()> {
    println!("Killing all tunnels...");
    // TODO: Implement kill logic
    println!("✓ All tunnels killed");

    Ok(())
}
