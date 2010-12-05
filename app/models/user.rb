class User < ActiveRecord::Base
  alias_attribute :to_s, :name
  
  has_many :maps, :inverse_of => :user
end
