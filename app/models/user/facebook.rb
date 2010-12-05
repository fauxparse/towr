class User::Facebook < ActiveRecord::Base
  set_table_name :facebook_authentications
  
  belongs_to :user
  
  def self.[](info)
    find_by_facebook_id(info["id"]) ||
    create({
      :facebook_id => info["id"],
      :user => User.create(:name => info["name"])
    })
  end
end