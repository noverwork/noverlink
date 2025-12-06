# typed: false
# frozen_string_literal: true

class Noverlink < Formula
  desc "Local-to-global tunneling CLI - expose your localhost to the web"
  homepage "https://github.com/noverwork/noverlink"
  version "0.1.0"
  license "AGPL-3.0-or-later"

  on_macos do
    on_arm do
      url "https://github.com/noverwork/noverlink/releases/download/v#{version}/noverlink-darwin-arm64.tar.gz"
      sha256 "PLACEHOLDER_SHA256_DARWIN_ARM64"
    end

    on_intel do
      url "https://github.com/noverwork/noverlink/releases/download/v#{version}/noverlink-darwin-x64.tar.gz"
      sha256 "PLACEHOLDER_SHA256_DARWIN_X64"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/noverwork/noverlink/releases/download/v#{version}/noverlink-linux-arm64.tar.gz"
      sha256 "PLACEHOLDER_SHA256_LINUX_ARM64"
    end

    on_intel do
      url "https://github.com/noverwork/noverlink/releases/download/v#{version}/noverlink-linux-x64.tar.gz"
      sha256 "PLACEHOLDER_SHA256_LINUX_X64"
    end
  end

  def install
    bin.install "noverlink"
  end

  test do
    assert_match "noverlink", shell_output("#{bin}/noverlink --version")
  end
end
