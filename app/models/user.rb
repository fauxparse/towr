class User < ActiveRecord::Base
  has_many :maps, :inverse_of => :user
  has_many :remember_tokens, :inverse_of => :user, :dependent => :destroy

  has_one :facebook, :class_name => "User::Facebook", :inverse_of => :user, :dependent => :destroy
  has_one :twitter, :class_name => "User::Twitter", :inverse_of => :user, :dependent => :destroy
  accepts_nested_attributes_for :facebook, :twitter

  alias_attribute :to_s, :name
end
