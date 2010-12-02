class User < ActiveRecord::Base
  alias_attribute :to_s, :name
end
