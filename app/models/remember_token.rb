require "active_support/secure_random"

class RememberToken < ActiveRecord::Base
  belongs_to :user, :inverse_of => :remember_tokens
  
  before_create :assign_token
  
  alias_attribute :to_s, :token
  
protected
  def assign_token
    self.token = SecureRandom.hex(32)
  end
  
end
